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
  // 使用 Graphics 绘制绿色菱形
  const graphics = this.add.graphics();
  
  // 设置绿色填充
  graphics.fillStyle(0x00ff00, 1);
  
  // 绘制菱形（四个点构成的多边形）
  const size = 50;
  graphics.beginPath();
  graphics.moveTo(0, -size);      // 上顶点
  graphics.lineTo(size, 0);       // 右顶点
  graphics.lineTo(0, size);       // 下顶点
  graphics.lineTo(-size, 0);      // 左顶点
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  graphics.generateTexture('diamond', size * 2, size * 2);
  graphics.destroy();
  
  // 创建菱形精灵，放置在屏幕中央偏上位置
  const diamond = this.add.sprite(400, 200, 'diamond');
  
  // 创建弹跳动画
  // 从当前位置向下弹跳 200 像素
  this.tweens.add({
    targets: diamond,
    y: 400,                    // 目标 y 坐标（向下移动）
    duration: 1500,            // 持续时间 1.5 秒
    ease: 'Bounce.easeOut',    // 弹跳缓动效果
    yoyo: true,                // 来回运动（下去再上来）
    repeat: -1,                // 无限循环
    hold: 0,                   // 到达目标点后立即返回
    repeatDelay: 0             // 每次重复之间无延迟
  });
  
  // 添加提示文本
  const text = this.add.text(400, 550, '绿色菱形弹跳动画 (1.5秒循环)', {
    fontSize: '20px',
    color: '#ffffff',
    align: 'center'
  });
  text.setOrigin(0.5);
}

new Phaser.Game(config);