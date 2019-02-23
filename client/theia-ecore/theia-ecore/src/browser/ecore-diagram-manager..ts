/*******************************************************************************
 * Copyright (c) 2018 EclipseSource Muenchen GmbH.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v10.html
 *   
 * Contributors:
 * 	EclipseSource Muenchen GmbH - initial API and implementation
 ******************************************************************************/
import { WidgetManager, Widget } from "@theia/core/lib/browser";
import { EditorManager } from "@theia/editor/lib/browser";
import { GLSPDiagramManager, GLSPTheiaSprottyConnector, GLSPDiagramWidget, GLSPTheiaDiagramServer } from "glsp-theia-extension/lib/browser";
import { inject, injectable } from "inversify";
import { TheiaFileSaver, DiagramWidgetOptions } from "sprotty-theia/lib";
import { EcoreLanguage } from "../common/ecore-language";
import { EcoreGLSPDiagramClient } from "./ecore-gslp-diagram-client";
import { ModelSource, TYPES, DiagramServer, RequestModelAction } from "sprotty";
import { RequestOperationsAction, RequestTypeHintsAction } from "glsp-sprotty/lib";

@injectable()
export class EcoreDiagramManager extends GLSPDiagramManager {
    readonly diagramType = EcoreLanguage.DiagramType;
    readonly iconClass = "fa fa-project-diagram";
    readonly label = EcoreLanguage.Label + " Editor";
    readonly fileExtensions = [EcoreLanguage.FileExtension]
    private _diagramConnector: GLSPTheiaSprottyConnector;

    constructor(
        @inject(EcoreGLSPDiagramClient) diagramClient: EcoreGLSPDiagramClient,
        @inject(TheiaFileSaver) fileSaver: TheiaFileSaver,
        @inject(WidgetManager) widgetManager: WidgetManager,
        @inject(EditorManager) editorManager: EditorManager) {
        super();
        this._diagramConnector = new GLSPTheiaSprottyConnector({ diagramClient, fileSaver, editorManager, widgetManager, diagramManager: this })
    }

    async createWidget(options?: any): Promise<Widget> {
        if (DiagramWidgetOptions.is(options)) {
            const clientId = this.createClientId()
            const config = this.diagramConfigurationRegistry.get(options.diagramType)
            const diContainer = config.createContainer(clientId + '_sprotty')
            const diagramWidget = new EcoreGLSPDiagramWidget(options, clientId, diContainer, this.editorPreferences, this.diagramConnector)
            return diagramWidget;
        }
        throw Error('DiagramWidgetFactory needs DiagramWidgetOptions but got ' + JSON.stringify(options))
    }

    get diagramConnector() {
        return this._diagramConnector
    }

}

class EcoreGLSPDiagramWidget extends GLSPDiagramWidget {
    protected initializeSprotty() {
        const modelSource = this.diContainer.get<ModelSource>(TYPES.ModelSource)
        if (modelSource instanceof DiagramServer)
            modelSource.clientId = this.id
        if (modelSource instanceof GLSPTheiaDiagramServer && this.connector)
            this.connector.connect(modelSource)
        this.disposed.connect(() => {
            if (modelSource instanceof GLSPTheiaDiagramServer && this.connector)
                this.connector.disconnect(modelSource)
        })
        this.actionDispatcher.dispatch(new RequestModelAction({
            sourceUri: this.options.uri,
            diagramType: this.options.diagramType,
            needsClientLayout: 'true',
            needsServerLayout: 'true'
        }))

        this.actionDispatcher.dispatch(new RequestOperationsAction());
        this.actionDispatcher.dispatch(new RequestTypeHintsAction());
    }
}

