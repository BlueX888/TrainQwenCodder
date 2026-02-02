const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: {
    preload: preload,
    create: create
  }
};

function preload() {
  // 使用 Graphics 绘制星形并生成纹理
  const graphics = this.add.graphics();
  
  // 设置黄色填充
  graphics.fillStyle(0xffff00, 1);
  
  // 绘制星形（5个尖角）
  // fillStar(x, y, points, innerRadius, outerRadius)
  graphics.fillStar(12, 12, 5, 5, 12);
  
  // 生成24x24的纹理
  graphics.generateTexture('star', 24, 24);
  
  // 销毁 graphics 对象，因为纹理已生成
  graphics.destroy();
}

function create() {
  // 添加提示文本
  this.add.text(10, 10, 'Click anywhere to create stars!', {
    fontSize: '16px',
    color: '#ffffff'
  });
  
  // 监听画布点击事件
  this.input.on('pointerdown', (pointer) => {
    // 在点击位置创建星形图像
    const star = this.add.image(pointer.x, pointer.y, 'star');
    
    // 设置星形的原点为中心（默认就是中心，但显式设置更清晰）
    star.setOrigin(0.5, 0.5);
  });
}

new Phaser.Game(config);