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
  // 不需要预加载外部资源
}

function create() {
  // 使用 Graphics 绘制红色方块
  const graphics = this.add.graphics();
  graphics.fillStyle(0xff0000, 1);
  graphics.fillRect(0, 0, 80, 80);
  
  // 生成纹理
  graphics.generateTexture('redSquare', 80, 80);
  graphics.destroy();
  
  // 创建精灵对象
  const square = this.add.sprite(400, 300, 'redSquare');
  
  // 创建弹跳动画
  // 从当前位置向上移动150像素，然后返回，整个过程3秒
  this.tweens.add({
    targets: square,
    y: square.y - 150,  // 向上弹跳150像素
    duration: 1500,      // 上升时间1.5秒
    ease: 'Cubic.easeOut', // 上升时使用缓出效果
    yoyo: true,          // 自动返回原位置
    repeat: -1,          // 无限循环
    repeatDelay: 0       // 无延迟
  });
  
  // 添加文字说明
  this.add.text(400, 50, 'Bouncing Red Square', {
    fontSize: '32px',
    color: '#ffffff'
  }).setOrigin(0.5);
  
  this.add.text(400, 550, '3-second bounce cycle (loop)', {
    fontSize: '20px',
    color: '#cccccc'
  }).setOrigin(0.5);
}

new Phaser.Game(config);