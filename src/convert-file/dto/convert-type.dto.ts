import { IsInt, Max, Min } from "class-validator";
import { ConvertFileAction } from "src/shared/convert-file.enum";

export class ConvertTypeDto {
    @IsInt()
    @Min(ConvertFileAction.PDF_TO_DOC)
    @Max(8)
    type: number;
}