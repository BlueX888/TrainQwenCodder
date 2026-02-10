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
  graphics.fillStyle(0x00ff00, 1); // 绿色
  
  // 绘制菱形（四个顶点）
  const size = 50;
  graphics.beginPath();
  graphics.moveTo(size, 0);        // 上顶点
  graphics.lineTo(size * 2, size); // 右顶点
  graphics.lineTo(size, size * 2); // 下顶点
  graphics.lineTo(0, size);        // 左顶点
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  graphics.generateTexture('diamond', size * 2, size * 2);
  graphics.destroy(); // 销毁 graphics 对象，只保留纹理
  
  // 创建菱形精灵，放置在屏幕中央上方
  const diamond = this.add.sprite(400, 200, 'diamond');
  
  // 创建弹跳动画
  // 使用 yoyo 模式实现上下弹跳，ease 使用 Bounce.easeOut 实现弹跳效果
  this.tweens.add({
    targets: diamond,
    y: 400, // 弹跳到的目标位置
    duration: 750, // 单程时间 750ms
    ease: 'Bounce.easeOut', // 弹跳缓动效果
    yoyo: true, // 往返运动
    repeat: -1 // 无限循环
  });
  
  // 添加说明文字
  const text = this.add.text(400, 550, '绿色菱形弹跳动画 (1.5秒循环)', {
    fontSize: '20px',
    color: '#ffffff',
    align: 'center'
  });
  text.setOrigin(0.5);
}

new Phaser.Game(config);