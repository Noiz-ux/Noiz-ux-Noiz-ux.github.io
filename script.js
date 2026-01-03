// 图表实例集合
let charts = {};

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    initializeHeroAnimations();
    initializeScrollEffects();
    initializeCharts();
    initializeMusicControl();
    initializeReadingProgress();
    initializeNumberCounters();
    initializeTypewriter();
});

// 音乐播放控制
function initializeMusicControl() {
    const musicToggle = document.getElementById('musicToggle');
    const backgroundMusic = document.getElementById('backgroundMusic');
    
    if (!musicToggle || !backgroundMusic) return;
    
    // 点击按钮切换播放/暂停
    musicToggle.addEventListener('click', function() {
        if (backgroundMusic.paused) {
            // 播放音乐
            backgroundMusic.play().then(() => {
                musicToggle.classList.add('playing');
                localStorage.setItem('musicPlaying', 'true');
            }).catch((error) => {
                console.warn('音乐播放失败:', error);
            });
        } else {
            // 暂停音乐
            backgroundMusic.pause();
            musicToggle.classList.remove('playing');
            localStorage.setItem('musicPlaying', 'false');
        }
    });
    
    // 默认自动播放音乐
    // 延迟一下，避免自动播放被阻止
    setTimeout(() => {
        backgroundMusic.play().then(() => {
            musicToggle.classList.add('playing');
            localStorage.setItem('musicPlaying', 'true');
        }).catch((error) => {
            // 自动播放失败（浏览器策略阻止），等待用户交互
            console.log('自动播放被阻止，等待用户点击按钮');
            // 如果用户之前手动暂停过，则不自动播放
            const wasPaused = localStorage.getItem('musicPlaying') === 'false';
            if (!wasPaused) {
                // 尝试在用户首次交互时自动播放
                const tryAutoPlay = () => {
                    backgroundMusic.play().then(() => {
                        musicToggle.classList.add('playing');
                        localStorage.setItem('musicPlaying', 'true');
                        document.removeEventListener('click', tryAutoPlay);
                        document.removeEventListener('scroll', tryAutoPlay);
                    }).catch(() => {});
                };
                document.addEventListener('click', tryAutoPlay, { once: true });
                document.addEventListener('scroll', tryAutoPlay, { once: true });
            }
        });
    }, 500);
    
    // 监听音乐结束（虽然设置了loop，但以防万一）
    backgroundMusic.addEventListener('ended', function() {
        musicToggle.classList.remove('playing');
        localStorage.setItem('musicPlaying', 'false');
    });
    
    // 监听音乐错误
    backgroundMusic.addEventListener('error', function() {
        console.error('音乐加载失败，请确保 m1.mp3 文件存在');
        musicToggle.style.opacity = '0.5';
        musicToggle.style.cursor = 'not-allowed';
    });
}

// 封面标题进入动画
function initializeHeroAnimations() {
    if (typeof anime === 'undefined') return;

    anime.timeline({
        easing: 'easeOutExpo',
        duration: 1000
    })
        .add({
            targets: '#title-main',
            opacity: [0, 1],
            translateY: [50, 0],
            delay: 500
        })
        .add({
            targets: '#subtitle',
            opacity: [0, 1],
            translateY: [30, 0],
            delay: 200
        }, '-=800')
        .add({
            targets: '#scroll-indicator',
            opacity: [0, 1],
            translateY: [20, 0],
            delay: 300
        }, '-=600');
}

// 长页滚动 & 流体感进入效果
function initializeScrollEffects() {
    const sections = document.querySelectorAll('.slide');
    const navDots = document.querySelectorAll('.nav-dot');

    if (!sections.length) return;

    // 初始：封面可见
    sections[0].classList.add('visible');

    const sectionMap = Array.from(sections).map((sec, idx) => ({
        id: sec.id,
        index: idx
    }));

    // 进入视口时淡入
    const observer = new IntersectionObserver(
        (entries) => {
            let activeIndex = null;

            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');

                    const id = entry.target.id;
                    const found = sectionMap.find((s) => s.id === id);
                    if (found) {
                        activeIndex = found.index;
                    }
                }
            });

            if (activeIndex !== null) {
                updateNavigationDots(activeIndex, navDots);
            }
        },
        {
            threshold: 0.42
        }
    );

    sections.forEach((sec) => observer.observe(sec));

    // 轻微流体感：根据滚动微调背景位置
    let latestScrollY = window.scrollY;
    let ticking = false;

    function onScroll() {
        latestScrollY = window.scrollY;
        if (!ticking) {
            window.requestAnimationFrame(() => {
                const offset = latestScrollY * 0.02;
                document.body.style.setProperty('--fluid-offset', `${offset}px`);
                ticking = false;
            });
            ticking = true;
        }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
}

// 初始化图表
function initializeCharts() {
    // 等待页面完全加载
    setTimeout(() => {
        initAgingGrowthChart();
        initAgingTrendChart();
        initMarriageAgeChart();
        initFertilityTrendChart();
        initCostBreakdownChart();
        initFertilityIntentionChart();
        
        // 标记所有图表为已加载
        setTimeout(() => {
            document.querySelectorAll('.chart-container').forEach(container => {
                container.classList.add('loaded');
            });
        }, 300);
    }, 500);
}

// 老龄化增长对比图
function initAgingGrowthChart() {
    const chartDom = document.getElementById('aging-growth-chart');
    if (!chartDom) return;
    
    const myChart = echarts.init(chartDom);
    charts.agingGrowth = myChart;
    
    const option = {
        title: {
            text: '2023-2024年老龄化数据对比',
            left: 'center',
            top: 10,
            textStyle: {
                fontSize: 16,
                color: '#3D4A52',
                fontFamily: 'Noto Serif SC'
            }
        },
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'shadow'
            }
        },
        legend: {
            data: ['2023年', '2024年'],
            top: 45,
            textStyle: {
                color: '#3D4A52'
            }
        },
        grid: {
            left: '3%',
            right: '4%',
            top: 80,
            bottom: '3%',
            containLabel: true
        },
        xAxis: {
            type: 'category',
            data: ['60岁以上人口(亿)', '60岁以上占比(%)', '65岁以上人口(亿)', '65岁以上占比(%)'],
            axisLabel: {
                color: '#3D4A52',
                fontSize: 12
            }
        },
        yAxis: {
            type: 'value',
            axisLabel: {
                color: '#3D4A52'
            }
        },
        series: [
            {
                name: '2023年',
                type: 'bar',
                data: [2.97, 21.1, 2.17, 15.4],
                itemStyle: {
                    color: '#8A9499'
                }
            },
            {
                name: '2024年',
                type: 'bar',
                data: [3.10, 22.0, 2.20, 15.6],
                itemStyle: {
                    color: '#B89B72'
                }
            }
        ]
    };
    
    myChart.setOption(option);
    
    // 响应式
    window.addEventListener('resize', function() {
        myChart.resize();
    });
}

// 老龄化趋势图
function initAgingTrendChart() {
    const chartDom = document.getElementById('aging-trend-chart');
    if (!chartDom) return;
    
    const myChart = echarts.init(chartDom);
    charts.agingTrend = myChart;
    
    const option = {
        title: {
            text: '中国人口老龄化趋势预测',
            textStyle: {
                fontSize: 16,
                color: '#3D4A52',
                fontFamily: 'Noto Serif SC'
            }
        },
        tooltip: {
            trigger: 'axis'
        },
        legend: {
            data: ['65岁以上占比', '60岁以上占比'],
            textStyle: {
                color: '#3D4A52'
            }
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
        },
        xAxis: {
            type: 'category',
            data: ['2020', '2021', '2022', '2023', '2024', '2025', '2030', '2035'],
            axisLabel: {
                color: '#3D4A52'
            }
        },
        yAxis: {
            type: 'value',
            name: '占比(%)',
            axisLabel: {
                color: '#3D4A52'
            }
        },
        series: [
            {
                name: '65岁以上占比',
                type: 'line',
                data: [13.5, 14.2, 14.9, 15.4, 15.6, 16.2, 18.5, 21.0],
                itemStyle: {
                    color: '#B89B72'
                },
                lineStyle: {
                    width: 3
                },
                smooth: true
            },
            {
                name: '60岁以上占比',
                type: 'line',
                data: [18.7, 19.8, 20.5, 21.1, 22.0, 22.8, 25.2, 28.1],
                itemStyle: {
                    color: '#3D4A52'
                },
                lineStyle: {
                    width: 3
                },
                smooth: true
            }
        ]
    };
    
    myChart.setOption(option);
    
    window.addEventListener('resize', function() {
        myChart.resize();
    });
}

// 初婚年龄变化图
function initMarriageAgeChart() {
    const chartDom = document.getElementById('marriage-age-chart');
    if (!chartDom) return;
    
    const myChart = echarts.init(chartDom);
    charts.marriageAge = myChart;
    
    const option = {
        title: {
            text: '中国男性初婚年龄中位数变化',
            textStyle: {
                fontSize: 16,
                color: '#3D4A52',
                fontFamily: 'Noto Serif SC'
            }
        },
        tooltip: {
            trigger: 'axis',
            formatter: function(params) {
                return params[0].name + '<br/>' +
                       '初婚年龄: ' + params[0].value + '岁';
            }
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
        },
        xAxis: {
            type: 'category',
            data: ['1940-1944', '1950-1954', '1960-1964', '1970-1974', '1980-1984', '北上广深1980-1984'],
            axisLabel: {
                color: '#3D4A52',
                rotate: 45
            }
        },
        yAxis: {
            type: 'value',
            name: '年龄(岁)',
            min: 22,
            max: 30,
            axisLabel: {
                color: '#3D4A52'
            }
        },
        series: [
            {
                name: '初婚年龄',
                type: 'line',
                data: [23.6, 24.2, 24.8, 25.1, 25.5, 27.6],
                itemStyle: {
                    color: '#B89B72'
                },
                lineStyle: {
                    width: 4
                },
                symbol: 'circle',
                symbolSize: 10,
                smooth: true,
                label: {
                    show: true,
                    position: 'top',
                    formatter: '{c}岁',
                    color: '#3D4A52'
                }
            }
        ]
    };
    
    myChart.setOption(option);
    
    window.addEventListener('resize', function() {
        myChart.resize();
    });
}

// 生育率趋势图
function initFertilityTrendChart() {
    const chartDom = document.getElementById('fertility-trend-chart');
    if (!chartDom) return;
    
    const myChart = echarts.init(chartDom);
    charts.fertilityTrend = myChart;
    
    const option = {
        title: {
            text: '中国总和生育率变化趋势',
            textStyle: {
                fontSize: 16,
                color: '#3D4A52',
                fontFamily: 'Noto Serif SC'
            }
        },
        tooltip: {
            trigger: 'axis',
            formatter: function(params) {
                return params[0].name + '年<br/>' +
                       '总和生育率: ' + params[0].value;
            }
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
        },
        xAxis: {
            type: 'category',
            data: ['1990', '1995', '2000', '2005', '2010', '2015', '2020', '2024'],
            axisLabel: {
                color: '#3D4A52'
            }
        },
        yAxis: {
            type: 'value',
            name: '总和生育率',
            min: 0,
            max: 3,
            axisLabel: {
                color: '#3D4A52'
            }
        },
        series: [
            {
                name: '总和生育率',
                type: 'line',
                data: [2.3, 1.8, 1.6, 1.4, 1.5, 1.6, 1.3, 1.085],
                itemStyle: {
                    color: '#B89B72'
                },
                lineStyle: {
                    width: 4
                },
                symbol: 'circle',
                symbolSize: 10,
                smooth: true,
                label: {
                    show: true,
                    position: 'top',
                    color: '#3D4A52'
                },
                markLine: {
                    data: [
                        {
                            yAxis: 2.1,
                            name: '人口更替水平',
                            lineStyle: {
                                color: '#e74c3c',
                                type: 'dashed',
                                width: 2
                            },
                            label: {
                                formatter: '人口更替水平（2.1）',
                                color: '#e74c3c',
                                position: 'insideEndTop',
                                fontSize: 12,
                                offset: [-48, -5]
                            }
                        }
                    ]
                }
            }
        ]
    };
    
    myChart.setOption(option);
    
    window.addEventListener('resize', function() {
        myChart.resize();
    });
}

// 养育成本构成饼图
function initCostBreakdownChart() {
    const chartDom = document.getElementById('cost-breakdown-chart');
    if (!chartDom) return;
    
    const myChart = echarts.init(chartDom);
    charts.costBreakdown = myChart;
    
    const option = {
        title: {
            text: '养育成本构成（0-17岁）',
            left: 'center',
            top: 10,
            textStyle: {
                fontSize: 16,
                color: '#3D4A52',
                fontFamily: 'Noto Serif SC'
            }
        },
        tooltip: {
            trigger: 'item',
            formatter: '{a} <br/>{b}: {c}万元 ({d}%)'
        },
        legend: {
            orient: 'horizontal',
            bottom: 10,
            textStyle: {
                color: '#3D4A52'
            }
        },
        series: [
            {
                name: '养育成本',
                type: 'pie',
                radius: ['35%', '55%'],
                center: ['50%', '45%'],
                avoidLabelOverlap: true,
                itemStyle: {
                    borderRadius: 6,
                    borderColor: '#fff',
                    borderWidth: 2
                },
                data: [
                    {value: 18.5, name: '教育费用'},
                    {value: 12.3, name: '住房成本'},
                    {value: 8.7, name: '医疗保健'},
                    {value: 6.8, name: '日常消费'},
                    {value: 4.2, name: '其他支出'}
                ],
                itemStyle: {
                    color: function(params) {
                        const colors = ['#B89B72', '#3D4A52', '#8A9499', '#C4B5A0', '#6B7B83'];
                        return colors[params.dataIndex];
                    }
                },
                emphasis: {
                    itemStyle: {
                        shadowBlur: 10,
                        shadowOffsetX: 0,
                        shadowColor: 'rgba(0, 0, 0, 0.5)'
                    }
                }
            }
        ]
    };
    
    myChart.setOption(option);
    
    window.addEventListener('resize', function() {
        myChart.resize();
    });
}

// 生育意愿雷达图
function initFertilityIntentionChart() {
    const chartDom = document.getElementById('fertility-intention-chart');
    if (!chartDom) return;
    
    const myChart = echarts.init(chartDom);
    charts.fertilityIntention = myChart;
    
    const option = {
        title: {
            text: '生育意愿评分（1-5分）',
            textStyle: {
                fontSize: 16,
                color: '#3D4A52',
                fontFamily: 'Noto Serif SC'
            }
        },
        tooltip: {},
        radar: {
            indicator: [
                { name: '一孩意愿', max: 5},
                { name: '二孩意愿', max: 5},
                { name: '三孩意愿', max: 5},
                { name: '理想子女数', max: 5},
                { name: '养育信心', max: 5}
            ],
            name: {
                textStyle: {
                    color: '#3D4A52'
                }
            }
        },
        series: [
            {
                name: '生育意愿',
                type: 'radar',
                data: [
                    {
                        value: [3.8, 3.11, 2.127, 2.8, 2.5],
                        name: '平均意愿',
                        itemStyle: {
                            color: '#B89B72'
                        },
                        areaStyle: {
                            color: 'rgba(184, 155, 114, 0.3)'
                        }
                    }
                ]
            }
        ]
    };
    
    myChart.setOption(option);
    
    window.addEventListener('resize', function() {
        myChart.resize();
    });
}

// 更新右侧导航圆点
function updateNavigationDots(activeIndex, dotsFromObserver) {
    const dots = dotsFromObserver || document.querySelectorAll('.nav-dot');
    dots.forEach((dot, index) => {
        if (index === activeIndex) {
            dot.classList.add('active');
        } else {
            dot.classList.remove('active');
        }
    });
}

// 页面可见性变化时重新渲染图表
document.addEventListener('visibilitychange', function() {
    if (!document.hidden) {
        setTimeout(() => {
            Object.values(charts).forEach(chart => {
                if (chart && typeof chart.resize === 'function') {
                    chart.resize();
                }
            });
        }, 100);
    }
});

// 导航到指定章节（供 HTML onclick 使用）
function scrollToSection(index) {
    const target = document.getElementById(`slide-${index}`);
    if (!target) return;
    target.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
    });
}

// 导出函数到全局作用域
window.scrollToSection = scrollToSection;

// 阅读进度条和滚动百分比
function initializeReadingProgress() {
    const progressBar = document.getElementById('readingProgressBar');
    const percentText = document.getElementById('scrollPercentText');
    
    function updateProgress() {
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollableHeight = documentHeight - windowHeight;
        const progress = (scrollTop / scrollableHeight) * 100;
        const clampedProgress = Math.min(100, Math.max(0, progress));
        
        if (progressBar) {
            progressBar.style.width = clampedProgress + '%';
        }
        
        if (percentText) {
            percentText.textContent = Math.round(clampedProgress) + '%';
        }
    }
    
    window.addEventListener('scroll', updateProgress, { passive: true });
    window.addEventListener('resize', updateProgress);
    updateProgress(); // 初始更新
}

// 数字滚动动画
function initializeNumberCounters() {
    const counters = document.querySelectorAll('.number-counter');
    if (!counters.length) return;
    
    const observerOptions = {
        threshold: 0.5,
        rootMargin: '0px'
    };
    
    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !entry.target.classList.contains('counted')) {
                entry.target.classList.add('counted');
                animateCounter(entry.target);
            }
        });
    }, observerOptions);
    
    counters.forEach(counter => {
        counterObserver.observe(counter);
    });
}

function animateCounter(element) {
    const target = parseFloat(element.getAttribute('data-target'));
    const suffix = element.getAttribute('data-suffix') || '';
    const duration = 2000; // 2秒
    const steps = 60;
    const increment = target / steps;
    const stepDuration = duration / steps;
    let current = 0;
    let step = 0;
    
    // 判断目标数字的小数位数
    const targetStr = element.getAttribute('data-target');
    const decimalPlaces = targetStr.includes('.') ? targetStr.split('.')[1].length : 0;
    
    const timer = setInterval(() => {
        step++;
        current += increment;
        
        if (step >= steps) {
            current = target;
            clearInterval(timer);
        }
        
        // 格式化数字显示
        if (decimalPlaces > 0) {
            // 有小数
            element.textContent = current.toFixed(decimalPlaces) + suffix;
        } else {
            // 整数
            element.textContent = Math.floor(current) + suffix;
        }
    }, stepDuration);
}

// 打字机效果
function initializeTypewriter() {
    const typewriterElements = document.querySelectorAll('.typewriter-text');
    if (!typewriterElements.length) return;
    
    const observerOptions = {
        threshold: 0.3,
        rootMargin: '0px'
    };
    
    const typewriterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !entry.target.classList.contains('typewriter-started')) {
                entry.target.classList.add('typewriter-started');
                const text = entry.target.getAttribute('data-text') || entry.target.textContent.trim();
                
                // 保存原始文本并重置
                entry.target.setAttribute('data-original', text);
                entry.target.textContent = '';
                
                // 延迟一下再开始打字效果
                setTimeout(() => {
                    typeText(entry.target, text, () => {
                        entry.target.classList.add('completed');
                    });
                }, 300);
            }
        });
    }, observerOptions);
    
    typewriterElements.forEach(element => {
        typewriterObserver.observe(element);
    });
}

function typeText(element, text, callback) {
    let index = 0;
    const typingSpeed = 150; // 每个字符的延迟（毫秒），可以调整速度
    
    function type() {
        if (index < text.length) {
            // 逐字显示文本
            element.textContent = text.substring(0, index + 1);
            index++;
            setTimeout(type, typingSpeed);
        } else {
            // 打字完成，移除光标
            if (callback) {
                setTimeout(() => {
                    callback();
                }, 500); // 延迟一下再移除光标，让用户看到完成效果
            }
        }
    }
    
    type();
}