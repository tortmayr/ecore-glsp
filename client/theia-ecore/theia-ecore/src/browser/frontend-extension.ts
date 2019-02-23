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
import { FrontendApplicationContribution, OpenHandler, WidgetFactory } from "@theia/core/lib/browser";
import { GLSPClientContribution } from "glsp-theia-extension/lib/browser";
import { ContainerModule, interfaces } from "inversify";
import { DiagramConfiguration, DiagramManager, DiagramManagerProvider } from "sprotty-theia/lib";
import { EcoreDiagramConfiguration } from "./ecore-diagram-configuration";
import { EcoreDiagramManager } from "./ecore-diagram-manager.";
import { EcoreGLClientContribution } from "./ecore-glclient-contribution";
import { EcoreGLSPDiagramClient } from "./ecore-gslp-diagram-client";


export default new ContainerModule((bind: interfaces.Bind, unbind: interfaces.Unbind, isBound: interfaces.IsBound, rebind: interfaces.Rebind) => {
    bind(EcoreGLClientContribution).toSelf().inSingletonScope()
    bind(GLSPClientContribution).toService(EcoreGLClientContribution);

    bind(EcoreGLSPDiagramClient).toSelf().inSingletonScope()

    bind(DiagramConfiguration).to(EcoreDiagramConfiguration).inSingletonScope()
    bind(EcoreDiagramManager).toSelf().inSingletonScope()
    bind(FrontendApplicationContribution).toService(EcoreDiagramManager)
    bind(OpenHandler).toService(EcoreDiagramManager)
    bind(WidgetFactory).toService(EcoreDiagramManager);
    bind(DiagramManagerProvider).toProvider<DiagramManager>((context) => {
        return () => {
            return new Promise<DiagramManager>((resolve) => {
                const diagramManager = context.container.get<EcoreDiagramManager>(EcoreDiagramManager);
                resolve(diagramManager);
            });
        };
    });
})

