const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  scene: { preload, create },
  backgroundColor: '#2d2d2d'
};

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 使用 Graphics 绘制星形并生成纹理
  const graphics = this.add.graphics();
  
  // 绘制橙色星形
  graphics.fillStyle(0xff8800, 1); // 橙色
  
  // 星形参数
  const centerX = 40;
  const centerY = 40;
  const outerRadius = 40;
  const innerRadius = 16;
  const points = 5;
  
  // 计算星形顶点
  const starPoints = [];
  for (let i = 0; i < points * 2; i++) {
    const angle = (i * Math.PI) / points - Math.PI / 2;
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    const x = centerX + Math.cos(angle) * radius;
    const y = centerY + Math.sin(angle) * radius;
    starPoints.push(x, y);
  }
  
  // 绘制星形路径
  graphics.beginPath();
  graphics.moveTo(starPoints[0], starPoints[1]);
  for (let i = 2; i < starPoints.length; i += 2) {
    graphics.lineTo(starPoints[i], starPoints[i + 1]);
  }
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理（80x80像素）
  graphics.generateTexture('star', 80, 80);
  graphics.destroy(); // 销毁 graphics 对象，只保留纹理
  
  // 监听点击事件
  this.input.on('pointerdown', (pointer) => {
    // 在点击位置创建星形
    const star = this.add.image(pointer.x, pointer.y, 'star');
    star.setOrigin(0.5, 0.5); // 设置中心点为原点
  });
  
  // 添加提示文本
  const text = this.add.text(400, 30, 'Click anywhere to create stars!', {
    fontSize: '20px',
    color: '#ffffff'
  });
  text.setOrigin(0.5, 0.5);
}

new Phaser.Game(config);