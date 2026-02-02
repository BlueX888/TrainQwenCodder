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
  // 使用 Graphics 绘制粉色星形并生成纹理
  const graphics = this.make.graphics({ x: 0, y: 0, add: false });
  
  // 设置粉色填充
  graphics.fillStyle(0xffc0cb, 1);
  
  // 绘制星形（中心点在 24, 24，外半径 24，内半径 10，5个角）
  graphics.fillStar(24, 24, 5, 10, 24, 0);
  
  // 生成 48x48 的纹理
  graphics.generateTexture('star', 48, 48);
  
  // 销毁临时 graphics 对象
  graphics.destroy();
}

function create() {
  // 添加提示文本
  this.add.text(400, 30, '点击画布任意位置生成粉色星形', {
    fontSize: '20px',
    color: '#ffffff'
  }).setOrigin(0.5);
  
  // 监听画布点击事件
  this.input.on('pointerdown', (pointer) => {
    // 在点击位置创建星形图像
    this.add.image(pointer.x, pointer.y, 'star');
  });
}

new Phaser.Game(config);