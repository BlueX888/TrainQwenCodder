const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create }
};

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 创建粉色菱形纹理
  const graphics = this.add.graphics();
  
  // 绘制菱形（中心点在 64, 64）
  graphics.fillStyle(0xff69b4, 1); // 粉色
  graphics.beginPath();
  graphics.moveTo(64, 16);  // 顶点
  graphics.lineTo(112, 64); // 右点
  graphics.lineTo(64, 112); // 底点
  graphics.lineTo(16, 64);  // 左点
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  graphics.generateTexture('diamond', 128, 128);
  graphics.destroy();
  
  // 创建菱形精灵
  const diamond = this.add.sprite(400, 200, 'diamond');
  
  // 创建弹跳动画
  // 从当前位置向下弹跳，然后返回
  this.tweens.add({
    targets: diamond,
    y: 400, // 弹跳到的目标位置
    duration: 750, // 下落时间 0.75 秒
    ease: 'Cubic.easeIn', // 下落加速
    yoyo: true, // 返回原位置
    yoyoEase: 'Bounce.easeOut', // 返回时使用弹跳缓动
    repeat: -1, // 无限循环
    repeatDelay: 0 // 无延迟
  });
  
  // 添加提示文字
  this.add.text(400, 500, 'Bouncing Diamond Animation', {
    fontSize: '24px',
    color: '#ffffff',
    fontFamily: 'Arial'
  }).setOrigin(0.5);
  
  // 添加时间显示（可选，用于验证1.5秒周期）
  const timeText = this.add.text(400, 550, '', {
    fontSize: '16px',
    color: '#aaaaaa',
    fontFamily: 'Arial'
  }).setOrigin(0.5);
  
  let elapsedTime = 0;
  this.time.addEvent({
    delay: 100,
    callback: () => {
      elapsedTime += 0.1;
      timeText.setText(`Time: ${elapsedTime.toFixed(1)}s (Cycle: ${(elapsedTime % 1.5).toFixed(1)}s)`);
    },
    loop: true
  });
}

new Phaser.Game(config);