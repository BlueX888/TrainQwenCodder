const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create }
};

function preload() {
  // 使用 Graphics 生成红色方块纹理
  const graphics = this.make.graphics({ x: 0, y: 0, add: false });
  graphics.fillStyle(0xff0000, 1);
  graphics.fillRect(0, 0, 64, 64);
  graphics.generateTexture('redSquare', 64, 64);
  graphics.destroy();
}

function create() {
  // 创建红色方块精灵
  const square = this.add.sprite(400, 300, 'redSquare');
  
  // 创建弹跳动画
  // 从中心位置向上弹跳 150 像素，然后回到原位
  this.tweens.add({
    targets: square,
    y: 150, // 弹跳到的最高点
    duration: 1500, // 上升时间 1.5 秒
    ease: 'Quad.easeOut', // 上升时减速
    yoyo: true, // 自动返回原位
    yoyoEase: 'Bounce.easeOut', // 下落时使用弹跳缓动
    repeat: -1, // 无限循环
    repeatDelay: 0 // 无延迟立即重复
  });
  
  // 添加地面参考线
  const ground = this.add.graphics();
  ground.lineStyle(2, 0x666666, 1);
  ground.lineBetween(0, 332, 800, 332);
  
  // 添加说明文字
  const text = this.add.text(400, 500, '红色方块弹跳动画 (3秒循环)', {
    fontSize: '24px',
    color: '#ffffff',
    fontFamily: 'Arial'
  });
  text.setOrigin(0.5);
}

new Phaser.Game(config);