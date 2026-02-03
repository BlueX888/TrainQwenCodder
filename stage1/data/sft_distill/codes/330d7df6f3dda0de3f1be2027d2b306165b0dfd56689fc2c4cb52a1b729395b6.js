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
  // 不需要加载外部资源
}

function create() {
  // 使用 Graphics 创建绿色星形纹理
  const graphics = this.add.graphics();
  
  // 绘制绿色星形
  graphics.fillStyle(0x00ff00, 1);
  graphics.beginPath();
  
  // 绘制五角星
  const centerX = 50;
  const centerY = 50;
  const outerRadius = 40;
  const innerRadius = 18;
  const points = 5;
  
  for (let i = 0; i < points * 2; i++) {
    const angle = (i * Math.PI) / points - Math.PI / 2;
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    const x = centerX + Math.cos(angle) * radius;
    const y = centerY + Math.sin(angle) * radius;
    
    if (i === 0) {
      graphics.moveTo(x, y);
    } else {
      graphics.lineTo(x, y);
    }
  }
  
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  graphics.generateTexture('starTexture', 100, 100);
  graphics.destroy();
  
  // 创建星形精灵并放置在屏幕中央偏上位置
  const star = this.add.sprite(400, 200, 'starTexture');
  
  // 创建弹跳动画
  // 使用两个连续的 tween 来实现更真实的弹跳效果
  this.tweens.add({
    targets: star,
    y: 450, // 向下弹跳到的位置
    scaleY: 0.8, // 落地时垂直压缩
    scaleX: 1.2, // 落地时水平拉伸
    duration: 1500, // 下落时间 1.5 秒
    ease: 'Cubic.easeIn', // 下落加速
    yoyo: true, // 返回原位
    repeat: -1, // 无限循环
    yoyoEase: 'Cubic.easeOut', // 上升减速
    onYoyo: function() {
      // 返回时恢复形状
      star.setScale(1, 1);
    },
    onRepeat: function() {
      // 每次重复时重置形状
      star.setScale(1, 1);
    }
  });
  
  // 添加旋转效果让动画更生动
  this.tweens.add({
    targets: star,
    angle: 360,
    duration: 3000, // 3 秒完成一次旋转
    repeat: -1,
    ease: 'Linear'
  });
  
  // 添加说明文字
  this.add.text(400, 550, '绿色星形弹跳动画 - 3秒循环', {
    fontSize: '20px',
    color: '#ffffff',
    align: 'center'
  }).setOrigin(0.5);
}

new Phaser.Game(config);