const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create }
};

function preload() {
  // 使用 Graphics 创建红色方块纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xff0000, 1);
  graphics.fillRect(0, 0, 64, 64);
  graphics.generateTexture('redSquare', 64, 64);
  graphics.destroy();
}

function create() {
  // 创建红色方块精灵
  const square = this.add.sprite(400, 100, 'redSquare');
  
  // 定义弹跳的目标位置
  const bounceHeight = 500; // 地面位置
  const startHeight = 100;  // 起始高度
  
  // 创建弹跳动画
  this.tweens.add({
    targets: square,
    y: bounceHeight,           // 目标 y 坐标（向下弹跳）
    duration: 1000,            // 下落时间 1 秒
    ease: 'Quad.easeIn',       // 下落加速
    yoyo: true,                // 来回运动
    repeat: -1,                // 无限循环
    repeatDelay: 0,            // 无延迟
    onYoyo: function() {
      // 当开始向上运动时，使用弹跳缓动
      this.ease = 'Bounce.easeOut';
      this.duration = 1000;
    },
    onRepeat: function() {
      // 当重新开始下落时，使用加速缓动
      this.ease = 'Quad.easeIn';
      this.duration = 1000;
    }
  });
  
  // 添加地面参考线
  const ground = this.add.graphics();
  ground.lineStyle(2, 0xffffff, 0.5);
  ground.lineBetween(0, bounceHeight + 32, 800, bounceHeight + 32);
  
  // 添加说明文字
  this.add.text(400, 30, '红色方块弹跳动画 (2秒循环)', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);