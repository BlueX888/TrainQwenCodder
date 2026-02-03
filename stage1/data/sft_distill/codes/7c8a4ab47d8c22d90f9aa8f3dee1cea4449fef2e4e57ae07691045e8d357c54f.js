const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  scene: { preload, create }
};

function preload() {
  // 使用 Graphics 绘制星形并生成纹理
  const graphics = this.add.graphics();
  
  // 设置绿色填充
  graphics.fillStyle(0x00ff00, 1);
  
  // 计算星形的顶点坐标
  const starPoints = [];
  const centerX = 16; // 星形中心点（32/2）
  const centerY = 16;
  const outerRadius = 16; // 外半径
  const innerRadius = 7;  // 内半径
  const points = 5; // 五角星
  
  for (let i = 0; i < points * 2; i++) {
    const angle = (i * Math.PI) / points - Math.PI / 2;
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    const x = centerX + Math.cos(angle) * radius;
    const y = centerY + Math.sin(angle) * radius;
    starPoints.push(x, y);
  }
  
  // 绘制星形
  graphics.fillPoints(starPoints, true);
  
  // 生成纹理
  graphics.generateTexture('star', 32, 32);
  
  // 清除 graphics 对象
  graphics.destroy();
}

function create() {
  // 创建15个随机位置的星形
  for (let i = 0; i < 15; i++) {
    const x = Phaser.Math.Between(32, 768); // 留出边距
    const y = Phaser.Math.Between(32, 568); // 留出边距
    
    // 添加星形图像
    this.add.image(x, y, 'star');
  }
}

new Phaser.Game(config);