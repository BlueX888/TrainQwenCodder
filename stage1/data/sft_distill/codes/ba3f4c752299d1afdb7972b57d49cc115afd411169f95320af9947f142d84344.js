const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  scene: { preload, create }
};

function preload() {
  // 无需预加载资源
}

function create() {
  // 创建 Graphics 对象
  const graphics = this.add.graphics();
  
  // 设置橙色填充
  graphics.fillStyle(0xff8800, 1);
  
  // 画布中心坐标
  const centerX = 400;
  const centerY = 300;
  
  // 星形参数
  const outerRadius = 16; // 外半径
  const innerRadius = 7;  // 内半径
  const points = 5;       // 5 个角
  
  // 开始绘制路径
  graphics.beginPath();
  
  // 计算并绘制星形的各个点
  for (let i = 0; i < points * 2; i++) {
    // 角度：每个点间隔 36 度（360 / 10）
    const angle = (i * Math.PI) / points - Math.PI / 2; // 从顶部开始
    
    // 奇数点使用外半径，偶数点使用内半径
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    
    // 计算点的坐标
    const x = centerX + Math.cos(angle) * radius;
    const y = centerY + Math.sin(angle) * radius;
    
    // 第一个点使用 moveTo，其余使用 lineTo
    if (i === 0) {
      graphics.moveTo(x, y);
    } else {
      graphics.lineTo(x, y);
    }
  }
  
  // 闭合路径并填充
  graphics.closePath();
  graphics.fillPath();
}

new Phaser.Game(config);