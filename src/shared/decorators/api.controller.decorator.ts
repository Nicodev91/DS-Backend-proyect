import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

export function ApiDocumentation(): (target: Function) => void {
  return (target: Function): void => {
    const controllerName = target.name.replace(/Controller$/, '');
    Controller(controllerName)(target);
    ApiTags(controllerName)(target);
  };
}
