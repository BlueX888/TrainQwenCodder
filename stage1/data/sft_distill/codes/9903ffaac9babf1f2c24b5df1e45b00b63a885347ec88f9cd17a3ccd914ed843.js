const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  scene: {
    preload: preload,
    create: create
  },
  backgroundColor: '#2d2d2d'
};

function preload() {
  // 不需要预加载外部资源
}

function create() {
  // 使用 Graphics 创建橙色方块纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xFFA500, 1); // 橙色
  graphics.fillRect(0, 0, 80, 80);
  
  // 生成纹理并销毁 graphics 对象
  graphics.generateTexture('orangeSquare', 80, 80);
  graphics.destroy();
  
  // 监听画布点击事件
  this.input.on('pointerdown', (pointer) => {
    // 在点击位置创建橙色方块
    // 使用 pointer.x 和 pointer.y 作为方块中心点
    this.add.image(pointer.x, pointer.y, 'orangeSquare');
  });
  
  // 添加提示文本
  this.add.text(10, 10, 'Click anywhere to create orange squares', {
    fontSize: '18px',
    color: '#ffffff'
  });
}

new Phaser.Game(config);