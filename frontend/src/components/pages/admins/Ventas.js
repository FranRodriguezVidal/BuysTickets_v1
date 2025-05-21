import { useTranslation } from "react-i18next";

export default function Ventas() {
    const { t } = useTranslation();

    return (
        <div>
            <h2>{t("Ventas Realizadas")}</h2>
        </div>
        
    );
}
