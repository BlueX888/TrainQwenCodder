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
  // 无需预加载外部资源
}

function create() {
  // 创建粉色菱形图形
  const graphics = this.add.graphics();
  
  // 设置粉色填充
  graphics.fillStyle(0xff69b4, 1);
  
  // 绘制菱形（使用四个点构成菱形）
  const size = 40;
  graphics.beginPath();
  graphics.moveTo(size, 0);           // 顶点
  graphics.lineTo(size * 2, size);    // 右点
  graphics.lineTo(size, size * 2);    // 底点
  graphics.lineTo(0, size);           // 左点
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  graphics.generateTexture('diamond', size * 2, size * 2);
  graphics.destroy();
  
  // 创建菱形精灵，放置在屏幕中央偏上位置
  const diamond = this.add.sprite(400, 200, 'diamond');
  
  // 创建弹跳动画
  // 从初始位置向下弹跳 200 像素，然后返回
  this.tweens.add({
    targets: diamond,
    y: 400,                           // 目标 y 坐标（向下移动 200 像素）
    duration: 750,                    // 下落时间 0.75 秒
    ease: 'Bounce.easeOut',           // 弹跳缓动效果（落地时弹跳）
    yoyo: true,                       // 返回原位置
    repeat: -1,                       // 无限循环
    repeatDelay: 0                    // 无延迟
  });
  
  // 添加提示文本
  this.add.text(400, 500, 'Pink Diamond Bouncing Animation', {
    fontSize: '24px',
    color: '#ffffff',
    align: 'center'
  }).setOrigin(0.5);
  
  this.add.text(400, 540, '1.5s loop cycle', {
    fontSize: '16px',
    color: '#aaaaaa',
    align: 'center'
  }).setOrigin(0.5);
}

new Phaser.Game(config);