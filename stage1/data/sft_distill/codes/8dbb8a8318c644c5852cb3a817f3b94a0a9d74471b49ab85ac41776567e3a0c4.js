const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create }
};

function preload() {
  // 创建菱形纹理
  const graphics = this.add.graphics();
  
  // 绘制绿色菱形
  graphics.fillStyle(0x00ff00, 1);
  graphics.beginPath();
  graphics.moveTo(32, 0);      // 上顶点
  graphics.lineTo(64, 32);     // 右顶点
  graphics.lineTo(32, 64);     // 下顶点
  graphics.lineTo(0, 32);      // 左顶点
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  graphics.generateTexture('diamond', 64, 64);
  graphics.destroy();
}

function create() {
  // 创建菱形精灵，初始位置在屏幕中央偏上
  const diamond = this.add.sprite(400, 200, 'diamond');
  
  // 定义弹跳的起始和结束位置
  const startY = 200;
  const endY = 400;
  
  // 创建弹跳动画
  this.tweens.add({
    targets: diamond,
    y: endY,                          // 目标 y 坐标（向下弹）
    duration: 1500,                   // 持续时间 1.5 秒
    ease: 'Bounce.Out',               // 弹跳缓动效果
    yoyo: false,                      // 不使用 yoyo（单向弹跳）
    repeat: -1,                       // 无限循环
    repeatDelay: 0,                   // 重复前无延迟
    onRepeat: () => {
      // 每次重复时重置到起始位置
      diamond.y = startY;
    }
  });
  
  // 添加说明文字
  this.add.text(400, 500, '绿色菱形弹跳动画 (1.5秒循环)', {
    fontSize: '20px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);