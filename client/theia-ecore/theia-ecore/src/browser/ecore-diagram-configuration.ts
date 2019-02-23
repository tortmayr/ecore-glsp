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
import { SelectionService } from "@theia/core";
import { defaultGLSPModule, KeyTool, modelHintsModule, TYPES } from "glsp-sprotty/lib";
import { GLSPTheiaDiagramServer } from 'glsp-theia-extension/lib/browser';
import { Container, inject, injectable } from "inversify";
import { createEcoreDiagramContainer } from "sprotty-ecore/lib";
import { TheiaDiagramServer } from "sprotty-theia";
import { DiagramConfiguration, TheiaKeyTool, TheiaSprottySelectionForwarder } from "sprotty-theia/lib";
import { EcoreLanguage } from "../common/ecore-language";

@injectable()
export class EcoreDiagramConfiguration implements DiagramConfiguration {
    @inject(SelectionService) protected readonly selectionService: SelectionService;
    diagramType: string = EcoreLanguage.DiagramType

    createContainer(widgetId: string): Container {
        const container = createEcoreDiagramContainer(widgetId, true, true);
        container.bind(TYPES.ModelSource).to(GLSPTheiaDiagramServer).inSingletonScope()
        container.bind(TheiaDiagramServer).toService(TYPES.ModelSource)
        container.rebind(KeyTool).to(TheiaKeyTool).inSingletonScope()
        container.bind(SelectionService).toConstantValue(this.selectionService)
        container.bind(TYPES.IActionHandlerInitializer).to(TheiaSprottySelectionForwarder)
        container.load(defaultGLSPModule, modelHintsModule)
        return container;
    }

}