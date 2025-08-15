import { Module, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { I18nModule, QueryResolver, HeaderResolver, CookieResolver } from 'nestjs-i18n';
import * as path from 'path';
import i18nConfig from './i18n.config';

@Global()
@Module({
  imports: [
    ConfigModule.forFeature(i18nConfig),
    I18nModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const i18nConf = configService.get('i18n');
        return {
          fallbackLanguage: i18nConf.fallbackLanguage,
          loaderOptions: {
            path: i18nConf.langPath,
            watch: process.env.NODE_ENV !== 'production',
          },
          resolvers: [
            { use: QueryResolver, options: [i18nConf.queryParameterName] },
            { use: HeaderResolver, options: [i18nConf.headerName] },
            { use: CookieResolver, options: [i18nConf.cookieName] },
          ],
          typesOutputPath: path.join(process.cwd(), 'src/i18n/i18n.generated.ts'),
        };
      },
    }),
  ],
  exports: [I18nModule],
})
export class AppI18nModule {}
