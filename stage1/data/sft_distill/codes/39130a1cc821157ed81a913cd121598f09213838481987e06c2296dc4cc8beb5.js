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

let diamond;
let initialX = 400;
let initialY = 300;

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 创建紫色菱形纹理
  const graphics = this.add.graphics();
  
  // 绘制紫色菱形
  graphics.fillStyle(0x9b59b6, 1); // 紫色
  graphics.beginPath();
  graphics.moveTo(50, 0);    // 上顶点
  graphics.lineTo(100, 50);  // 右顶点
  graphics.lineTo(50, 100);  // 下顶点
  graphics.lineTo(0, 50);    // 左顶点
  graphics.closePath();
  graphics.fillPath();
  
  // 生成紫色菱形纹理
  graphics.generateTexture('diamondPurple', 100, 100);
  graphics.clear();
  
  // 绘制橙色菱形纹理（拖拽时使用）
  graphics.fillStyle(0xe67e22, 1); // 橙色
  graphics.beginPath();
  graphics.moveTo(50, 0);
  graphics.lineTo(100, 50);
  graphics.lineTo(50, 100);
  graphics.lineTo(0, 50);
  graphics.closePath();
  graphics.fillPath();
  
  // 生成橙色菱形纹理
  graphics.generateTexture('diamondOrange', 100, 100);
  graphics.destroy(); // 销毁 graphics 对象
  
  // 创建菱形精灵
  diamond = this.add.sprite(initialX, initialY, 'diamondPurple');
  
  // 设置为可交互和可拖拽
  diamond.setInteractive({ draggable: true });
  
  // 监听拖拽开始事件
  diamond.on('dragstart', function(pointer) {
    // 拖拽时改变为橙色
    this.setTexture('diamondOrange');
  });
  
  // 监听拖拽事件
  diamond.on('drag', function(pointer, dragX, dragY) {
    // 更新菱形位置
    this.x = dragX;
    this.y = dragY;
  });
  
  // 监听拖拽结束事件
  diamond.on('dragend', function(pointer) {
    // 恢复为紫色
    this.setTexture('diamondPurple');
    
    // 使用补间动画回到初始位置
    this.scene.tweens.add({
      targets: this,
      x: initialX,
      y: initialY,
      duration: 300,
      ease: 'Power2'
    });
  });
  
  // 添加提示文本
  this.add.text(400, 50, '拖拽紫色菱形试试！', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);