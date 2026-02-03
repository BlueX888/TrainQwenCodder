const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create }
};

function preload() {
  // 不需要预加载外部资源
}

function create() {
  // 创建青色椭圆
  const ellipse = this.add.ellipse(400, 300, 120, 80, 0x00ffff);
  
  // 记录初始位置
  const startY = 300;
  const bounceHeight = 200; // 弹跳高度
  
  // 创建弹跳动画
  this.tweens.add({
    targets: ellipse,
    y: startY - bounceHeight, // 向上弹跳
    duration: 1000, // 上升时间 1 秒
    ease: 'Quad.easeOut', // 上升时减速
    yoyo: true, // 返回原位置
    yoyoEase: 'Bounce.easeOut', // 下落时弹跳效果
    repeat: -1, // 无限循环
    repeatDelay: 0 // 无延迟
  });
  
  // 添加地面参考线（可选，用于视觉参考）
  const ground = this.add.graphics();
  ground.lineStyle(2, 0xffffff, 0.3);
  ground.lineBetween(200, startY + 40, 600, startY + 40);
  
  // 添加提示文本
  const text = this.add.text(400, 50, 'Bouncing Ellipse', {
    fontSize: '32px',
    color: '#00ffff',
    fontFamily: 'Arial'
  });
  text.setOrigin(0.5);
}

new Phaser.Game(config);