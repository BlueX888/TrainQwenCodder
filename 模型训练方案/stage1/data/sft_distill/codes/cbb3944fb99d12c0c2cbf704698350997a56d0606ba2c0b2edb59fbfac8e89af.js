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
  // 无需预加载外部资源
}

function create() {
  // 使用 Graphics 创建橙色方块纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xFFA500, 1); // 橙色
  graphics.fillRect(0, 0, 80, 80);
  
  // 生成纹理并命名为 'orangeSquare'
  graphics.generateTexture('orangeSquare', 80, 80);
  
  // 销毁 graphics 对象，释放内存
  graphics.destroy();
  
  // 监听画布点击事件
  this.input.on('pointerdown', (pointer) => {
    // 在点击位置创建橙色方块
    const square = this.add.sprite(pointer.x, pointer.y, 'orangeSquare');
    
    // 设置锚点为中心，使方块以点击点为中心生成
    square.setOrigin(0.5, 0.5);
  });
  
  // 添加提示文本
  this.add.text(10, 10, 'Click anywhere to create orange squares!', {
    fontSize: '18px',
    color: '#ffffff'
  });
}

new Phaser.Game(config);