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
  const graphics = this.make.graphics({ x: 0, y: 0, add: false });
  
  // 设置黄色填充
  graphics.fillStyle(0xffff00, 1);
  
  // 绘制星形（中心点在 12,12，半径12像素）
  // fillStar(x, y, points, innerRadius, outerRadius, rotation)
  graphics.fillStar(12, 12, 5, 5, 12, 0);
  
  // 生成24x24的纹理
  graphics.generateTexture('star', 24, 24);
  
  // 销毁临时 graphics 对象
  graphics.destroy();
}

function create() {
  // 添加提示文本
  this.add.text(400, 30, '点击画布任意位置生成星形', {
    fontSize: '20px',
    color: '#ffffff'
  }).setOrigin(0.5);
  
  // 监听指针按下事件
  this.input.on('pointerdown', (pointer) => {
    // 在点击位置创建星形图像
    this.add.image(pointer.x, pointer.y, 'star');
  });
}

new Phaser.Game(config);