import { useTranslation } from "react-i18next";

export default function Entradas() {
    const { t } = useTranslation();

    return (
        <div>
            <h1>{t("Mis entradas")}</h1>
        </div>
        
    );
}
