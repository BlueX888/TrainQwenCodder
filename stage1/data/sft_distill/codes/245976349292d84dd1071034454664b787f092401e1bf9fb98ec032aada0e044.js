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
  // 使用 Graphics 创建圆形纹理
  const graphics = this.make.graphics({ x: 0, y: 0, add: false });
  graphics.fillStyle(0x00ff00, 1);
  graphics.fillCircle(50, 50, 50); // 圆心在(50,50)，半径50
  graphics.generateTexture('circle', 100, 100);
  graphics.destroy();
}

function create() {
  // 创建圆形精灵并居中
  const circle = this.add.sprite(400, 300, 'circle');
  
  // 创建缩放动画
  // 使用 yoyo 实现从 0.8 恢复到 1 的效果
  // duration 为单程时间，yoyo 会自动返回，总时长 = duration * 2
  this.tweens.add({
    targets: circle,
    scaleX: 0.8,
    scaleY: 0.8,
    duration: 1250, // 单程 1.25 秒，往返共 2.5 秒
    ease: 'Sine.easeInOut',
    yoyo: true, // 自动返回到初始值
    repeat: -1 // -1 表示无限循环
  });
  
  // 添加文字说明
  this.add.text(400, 500, 'Circle scaling: 100% → 80% → 100% (2.5s loop)', {
    fontSize: '20px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);