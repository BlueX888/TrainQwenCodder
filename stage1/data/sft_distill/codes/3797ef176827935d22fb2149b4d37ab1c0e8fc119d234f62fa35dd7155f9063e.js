const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create }
};

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 创建 Graphics 对象用于绘制星形
  const graphics = this.add.graphics();
  
  // 设置蓝色填充
  graphics.fillStyle(0x0066ff, 1);
  
  // 绘制星形路径
  const starSize = 32; // 半径（总大小64像素）
  const points = 5; // 五角星
  const innerRadius = starSize * 0.4; // 内半径
  const outerRadius = starSize; // 外半径
  
  // 计算星形顶点
  const starPath = new Phaser.Geom.Path();
  
  for (let i = 0; i < points * 2; i++) {
    const angle = (i * Math.PI) / points - Math.PI / 2;
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    const x = starSize + Math.cos(angle) * radius;
    const y = starSize + Math.sin(angle) * radius;
    
    if (i === 0) {
      starPath.moveTo(x, y);
    } else {
      starPath.lineTo(x, y);
    }
  }
  
  starPath.closePath();
  
  // 填充星形
  graphics.fillPath(starPath);
  
  // 生成星形纹理
  graphics.generateTexture('star', starSize * 2, starSize * 2);
  
  // 清除并销毁 Graphics 对象
  graphics.destroy();
  
  // 在随机位置添加20个星形
  for (let i = 0; i < 20; i++) {
    const x = Phaser.Math.Between(32, 768); // 留出边距
    const y = Phaser.Math.Between(32, 568); // 留出边距
    
    const star = this.add.image(x, y, 'star');
    star.setOrigin(0.5, 0.5);
  }
}

new Phaser.Game(config);