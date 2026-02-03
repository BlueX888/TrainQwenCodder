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
  // 不需要加载外部资源
}

function create() {
  // 使用 Graphics 创建橙色方块纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xff8800, 1);
  graphics.fillRect(0, 0, 100, 100);
  graphics.generateTexture('orangeBox', 100, 100);
  graphics.destroy();

  // 创建可拖拽的方块
  const box = this.add.sprite(400, 300, 'orangeBox');
  
  // 保存初始位置
  const initialX = box.x;
  const initialY = box.y;
  
  // 设置为可交互和可拖拽
  box.setInteractive();
  this.input.setDraggable(box);

  // 监听拖拽事件
  this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
    // 更新方块位置
    gameObject.x = dragX;
    gameObject.y = dragY;
    
    // 改变颜色为黄色
    gameObject.setTint(0xffff00);
  });

  // 监听拖拽结束事件
  this.input.on('dragend', (pointer, gameObject) => {
    // 回到初始位置
    gameObject.x = initialX;
    gameObject.y = initialY;
    
    // 恢复原始颜色
    gameObject.clearTint();
  });

  // 添加提示文本
  this.add.text(400, 50, '拖拽橙色方块试试！', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);