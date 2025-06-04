import { useState, useEffect, useRef } from 'react';
import Select from 'react-select';

const SelectInput = ({ options, defaultValue, onChange }) => {
    const scrollContainerRef = useRef(null);
    // select 드롭다운 오픈 여부
    const [menuOpen, setMenuOpen] = useState(false);

    const [selectOption, setSelectOption] = useState();


    const selectOnChange = (e) => {
        setSelectOption(e);
        onChange(e.value);
    };

    // 드롭다운 닫기
    const handleScroll = () => {
        setMenuOpen(false);
    };

    // 드롭다운 오픈시 실행
    const handleMenuOpen = () => {
        setMenuOpen(true);
        scrollContainerRef.current = document.getElementById("table-container");
        if (scrollContainerRef.current) {
            scrollContainerRef.current.addEventListener("scroll", handleScroll, { once: true });
        }
    };

    // 드롭다운 닫힐시 실행
    const handleMenuClose = () => {
        setMenuOpen(false);
        if (scrollContainerRef.current) {
            scrollContainerRef.current.removeEventListener("scroll", handleScroll);
        }
    };

    useEffect(() => {
        setSelectOption(options.find(opt => opt.value === defaultValue));
    }, [options, defaultValue]);

    return (
        <div>
            <Select
                onChange={selectOnChange}
                options={options}
                value={selectOption}
                menuIsOpen={menuOpen}
                onMenuOpen={handleMenuOpen}
                onMenuClose={handleMenuClose}
                menuPortalTarget={document.body}
                menuPosition="fixed"
                menuShouldBlockScroll={false}
                styles={{
                container: (provided) => ({
                    ...provided,
                    width: "100%",
                    zIndex: 3,
                }),
                menuPortal: (base) => ({
                    ...base,
                    zIndex: 9999,
                }),
                }}
            />
        </div>
    );
    };

export default SelectInput;
