/*
 * Copyright (C) 2017 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */

import { Container, ContainerModule } from "inversify";
import { boundsModule, buttonModule, configureModelElement, configureViewerOptions, ConsoleLogger, defaultModule, edgeEditModule, ExpandButtonView, expandModule, exportModule, fadeModule, hoverModule, HtmlRoot, HtmlRootView, LogLevel, moveModule, PolylineEdgeView, PreRenderedElement, PreRenderedView, SButton, SCompartment, SCompartmentView, SEdge, selectModule, SGraph, SGraphView, SLabel, SLabelView, SRoutingHandle, SRoutingHandleView, TYPES, undoRedoModule, viewportModule } from "sprotty/lib";
import { ClassNode, EdgeWithMultiplicty, Icon, Link } from "./model";
import { AggregationEdgeView, ArrowEdgeView, ClassNodeView, CompositionEdgeView, IconView, InheritanceEdgeView, LinkView } from "./views";
import { ElkFactory, elkLayoutModule, ElkLayoutEngine } from "sprotty-elk/lib";
import ElkConstructor from 'elkjs/lib/elk.bundled';

export default (containerId: string, withSelectionSupport: boolean) => {
    const classDiagramModule = new ContainerModule((bind, unbind, isBound, rebind) => {
        rebind(TYPES.ILogger).to(ConsoleLogger).inSingletonScope();
        rebind(TYPES.LogLevel).toConstantValue(LogLevel.log);
        const context = { bind, unbind, isBound, rebind };
        configureModelElement(context, 'graph', SGraph, SGraphView);
        configureModelElement(context, 'node:class', ClassNode, ClassNodeView);
        configureModelElement(context, 'label:heading', SLabel, SLabelView);
        configureModelElement(context, 'label:text', SLabel, SLabelView);
        configureModelElement(context, 'comp:comp', SCompartment, SCompartmentView);
        configureModelElement(context, 'comp:header', SCompartment, SCompartmentView);
        configureModelElement(context, 'icon', Icon, IconView);
        configureModelElement(context, 'label:icon', SLabel, SLabelView);
        configureModelElement(context, 'edge:straight', SEdge, PolylineEdgeView);
        configureModelElement(context, 'html', HtmlRoot, HtmlRootView);
        configureModelElement(context, 'pre-rendered', PreRenderedElement, PreRenderedView);
        configureModelElement(context, 'button:expand', SButton, ExpandButtonView);
        configureModelElement(context, 'routing-point', SRoutingHandle, SRoutingHandleView);
        configureModelElement(context, 'volatile-routing-point', SRoutingHandle, SRoutingHandleView);
        configureModelElement(context, 'edge:association', SEdge, ArrowEdgeView)
        configureModelElement(context, 'edge:inheritance', SEdge, InheritanceEdgeView)
        configureModelElement(context, 'edge:aggregation', EdgeWithMultiplicty, AggregationEdgeView)
        configureModelElement(context, 'edge:composition', EdgeWithMultiplicty, CompositionEdgeView)
        configureModelElement(context, 'link', Link, LinkView)
        configureViewerOptions(context, {
            needsClientLayout: true,
            baseDiv: containerId
        });

        const elkFactory: ElkFactory = () => new ElkConstructor({
            algorithms: ['layered'],
            defaultLayoutOptions: {
                'edgeLabels.placement': 'CENTER',
                'edgeLabels.sideSelection': 'ALWAYS_UP'
            }
        });
        bind(TYPES.IModelLayoutEngine).to(ElkLayoutEngine);
        bind(ElkFactory).toConstantValue(elkFactory);
    });

    const container = new Container();
    const modules = [
        defaultModule,
        moveModule,
        boundsModule,
        undoRedoModule,
        viewportModule,
        selectModule,
        fadeModule,
        hoverModule,
        exportModule,
        expandModule,
        buttonModule,
        edgeEditModule,
        classDiagramModule,
        elkLayoutModule]
        
    if (withSelectionSupport) {
        modules.push(selectModule);
    }

    container.load(...modules);
    return container;
};
