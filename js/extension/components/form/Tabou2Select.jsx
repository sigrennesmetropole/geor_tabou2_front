import React, {useState, useEffect} from 'react';
import Select from 'react-select';
import "@js/extension/css/identify.css";

/**
 * Composant Select/MultiSelect basé sur react-select
 * Utiliser la prop isMulti pour gérer la sélection simple ou multiple
 */
const Tabou2Select = ({
    value,
    textField,
    valueField = "id",
    placeholder = "",
    search = () => Promise.resolve([]),
    load = null,
    onLoad = null,
    onSelect = () => {
    },
    onChange = () => {
    },
    disabled = false,
    minLength = 0,
    allowClear = true,
    defaultValue = null,
    isMulti = false
}) => {
    const [options, setOptions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [initialized, setInitialized] = useState(false);

    // Déclaration de loadOptions AVANT les useEffect pour éviter l'erreur ESLint
    const loadOptions = async(text = "") => {
        setLoading(true);
        try {
            const searchFunction = load || search;
            let results = await searchFunction(text);
            if (onLoad && typeof onLoad === 'function') {
                results = onLoad(results);
            }
            setOptions(results || []);
        } catch (error) {
            console.error("Erreur lors du chargement des options:", error);
            setOptions([]);
        }
        setLoading(false);
    };

    useEffect(() => {
        if (!initialized && (!value || (isMulti && value.length === 0)) && defaultValue) {
            onSelect(defaultValue);
            setInitialized(true);
        }
    }, [defaultValue, value, onSelect, initialized, isMulti]);

    // Charger les options au montage si une valeur existe et options vide
    useEffect(() => {
        if (
            ((isMulti && Array.isArray(value) && value.length > 0) || (!isMulti && value))
                && options.length === 0
        ) {
            loadOptions();
        }
    }, [isMulti, value, options.length]);

    // Afficher la valeur actuelle même si elle n'est pas dans les options
    const getSelectValue = () => {
        if (isMulti) {
            if (!Array.isArray(value) || value.length === 0) return [];
            // Filtrer les valeurs nulles/undefined
            const filteredValue = value.filter(val => val !== null && val !== undefined);
            const inOptions = options.filter(opt =>
                filteredValue.some(val => String(val?.[valueField] ?? val) === String(opt[valueField]))
            );
            const notInOptions = filteredValue.filter(val =>
                !options.some(opt => String(opt[valueField]) === String(val?.[valueField] ?? val))
            );
            return [...inOptions, ...notInOptions];
        }
        // Single select : si la valeur n'est pas dans les options, on la retourne quand même
        if (value === null || value === undefined) return null;

        // Si value est un objet, chercher par valueField (id)
        if (typeof value === 'object') {
            const selected = options.find(opt => String(opt[valueField]) === String(value?.[valueField]));
            if (selected) return selected;
            if (value[valueField]) return value;
            return null;
        }

        // Si value est une string, on cherche d'abord par valueField puis par textField
        // Cela permet de gérer le cas où l'API retourne un libellé en string au lieu d'un objet
        // Par exemple : libelleTypeDocument: "Plan guide" au lieu de {id: 6, libelle: "Plan guide"}
        const selectedById = options.find(opt => String(opt[valueField]) === String(value));
        if (selectedById) return selectedById;

        const selectedByLabel = options.find(opt => String(opt[textField]) === String(value));
        if (selectedByLabel) return selectedByLabel;

        return null;
    };

    const hasValue = isMulti ? (value && value.length > 0) : !!value;
    const controlColor = hasValue ? '#495057' : '#6c757d';

    const handleChange = selected => {
        if (isMulti) {
            onSelect(selected || []);
            onChange(selected || []);
        } else {
            onSelect(selected);
            onChange(selected);
        }
    }

    return (
        <div style={{position: 'relative'}}>
            <Select
                options={options}
                value={getSelectValue()}
                getOptionLabel={opt => opt[textField]}
                getOptionValue={opt => opt[valueField]}
                onChange={handleChange}
                isMulti={isMulti}
                isDisabled={disabled}
                isClearable={allowClear && !disabled}
                placeholder={placeholder}
                isLoading={loading}
                onInputChange={input => {
                    if (input.length >= minLength) {
                        loadOptions(input);
                    } else {
                        loadOptions();
                    }
                }}
                onMenuOpen={() => {
                    if (!options.length) {
                        loadOptions();
                    }
                }}
                components={{
                    MultiValueRemove: disabled ? () => null : undefined
                }}
                styles={{
                    control: (base, state) => ({
                        ...base,
                        backgroundColor: disabled ? '#e9ecef' : 'white',
                        color: controlColor,
                        minHeight: '32px',
                        boxShadow: state.isFocused ? '0 0 0 1px #2684FF' : base.boxShadow
                    })
                }}
            />
        </div>
    );
};

export default Tabou2Select;
