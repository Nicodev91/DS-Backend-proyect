import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, OpenAPIObject, SwaggerModule } from '@nestjs/swagger';
import { apiReference } from '@scalar/nestjs-api-reference';
import { EnvValues } from '@shared/environment/config/env-values.config';
import { RelativePathEnums } from '@shared/environment/paths-enums';
import { ReadFile, TransformTo64 } from '@shared/utils/FileUtils';
import { ScalarOptions } from './scalar-constants';
import { Response } from 'express';

export class ScalarClient {
  register(app: INestApplication): void {
    const document = SwaggerModule.createDocument(
      app,
      GenerateDocumentBuilder(),
    );
    const prefix = EnvValues.get().GLOBAL_PREFIX;
    const processedDocument = {
      ...document,
      paths: Object.entries(document.paths).reduce((acc, [path, methods]) => {
        if (path.includes('/Health')) {
          acc[path] = methods;
        } else {
          const newPath = `${prefix}${path}`;
          acc[newPath] = methods;

          prefix.toString();
        }
        return acc;
      }, {}),
    };

    // Leer archivos con manejo de errores
    let customCss = '';
    let favicon = '';
    
    try {
      customCss = ReadFile(RelativePathEnums.SCALAR_PATH, 'flytheme.css');
    } catch (error) {
      console.warn('⚠️ Could not load flytheme.css, using default styling');
    }
    
    try {
      favicon = TransformTo64(RelativePathEnums.SCALAR_PATH, 'favicon.ico');
    } catch (error) {
      console.warn('⚠️ Could not load favicon.ico, using default favicon');
    }

    app.use(
      ScalarOptions.path,
      apiReference({
        spec: {
          content: processedDocument,
        },
        customCss: customCss || undefined,
        favicon: favicon || undefined,
      }),
    );

    app.use(`${ScalarOptions.path}.json`, (_, res: Response): void => {
      res.setHeader('Content-Type', 'application/json');
      res.send(document);
    });
  }
}

const GenerateDocumentBuilder = (): Omit<OpenAPIObject, "paths"> => {
  return new DocumentBuilder()
    .setTitle(ScalarOptions.title)
    .setDescription(ScalarOptions.description)
    .setVersion(ScalarOptions.version)
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth', // This name here is important for references
    )
    .build();
};
