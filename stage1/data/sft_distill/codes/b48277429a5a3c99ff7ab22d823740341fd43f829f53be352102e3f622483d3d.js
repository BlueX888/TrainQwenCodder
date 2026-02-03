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
  
  // 设置粉色填充
  graphics.fillStyle(0xff69b4, 1);
  
  // 绘制星形（中心点在 40,40，外半径 40，内半径 16，5个角）
  graphics.fillStar(40, 40, 5, 16, 40, 0);
  
  // 生成纹理，尺寸 80x80
  graphics.generateTexture('pinkStar', 80, 80);
  
  // 销毁 graphics 对象
  graphics.destroy();
}

function create() {
  // 添加提示文本
  this.add.text(400, 30, '点击画布任意位置生成粉色星形', {
    fontSize: '20px',
    color: '#ffffff'
  }).setOrigin(0.5);
  
  // 监听指针按下事件
  this.input.on('pointerdown', (pointer) => {
    // 在点击位置创建星形图像
    this.add.image(pointer.x, pointer.y, 'pinkStar');
  });
}

new Phaser.Game(config);