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

let rectangle;
let initialX;
let initialY;

function preload() {
  // 创建绿色矩形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1);
  graphics.fillRect(0, 0, 100, 80);
  graphics.generateTexture('greenRect', 100, 80);
  graphics.destroy();
  
  // 创建黄色矩形纹理（拖拽时使用）
  const graphicsYellow = this.add.graphics();
  graphicsYellow.fillStyle(0xffff00, 1);
  graphicsYellow.fillRect(0, 0, 100, 80);
  graphicsYellow.generateTexture('yellowRect', 100, 80);
  graphicsYellow.destroy();
}

function create() {
  // 创建矩形精灵
  rectangle = this.add.sprite(400, 300, 'greenRect');
  
  // 记录初始位置
  initialX = rectangle.x;
  initialY = rectangle.y;
  
  // 设置为可交互和可拖拽
  rectangle.setInteractive({ draggable: true });
  
  // 监听拖拽开始事件
  rectangle.on('dragstart', function(pointer) {
    // 改变为黄色
    this.setTexture('yellowRect');
  });
  
  // 监听拖拽中事件
  rectangle.on('drag', function(pointer, dragX, dragY) {
    // 更新位置跟随指针
    this.x = dragX;
    this.y = dragY;
  });
  
  // 监听拖拽结束事件
  rectangle.on('dragend', function(pointer) {
    // 恢复绿色
    this.setTexture('greenRect');
    
    // 回到初始位置
    this.x = initialX;
    this.y = initialY;
  });
  
  // 添加提示文字
  this.add.text(400, 50, '拖拽绿色矩形试试！', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
  
  this.add.text(400, 550, '松手后会自动回到中心位置', {
    fontSize: '18px',
    color: '#aaaaaa'
  }).setOrigin(0.5);
}

new Phaser.Game(config);