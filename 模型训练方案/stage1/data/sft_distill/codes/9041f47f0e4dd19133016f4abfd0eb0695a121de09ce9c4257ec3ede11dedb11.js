const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create, update }
};

// 全局状态变量用于验证
let animationActive = true;
let animationCount = 0;

function preload() {
  // 创建纯色纹理用于物体显示
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1);
  graphics.fillCircle(25, 25, 25);
  graphics.generateTexture('circle', 50, 50);
  graphics.destroy();
}

function create() {
  // 重置状态变量
  animationActive = true;
  animationCount = 0;

  // 创建10个物体数组
  const objects = [];
  
  // 在场景中均匀分布10个圆形物体
  for (let i = 0; i < 10; i++) {
    const x = 100 + (i % 5) * 150;
    const y = 200 + Math.floor(i / 5) * 200;
    
    const obj = this.add.sprite(x, y, 'circle');
    obj.setTint(Phaser.Display.Color.HSVToRGB(i / 10, 1, 1).color);
    objects.push(obj);
  }

  // 为所有物体创建同步的淡入淡出动画
  objects.forEach((obj, index) => {
    const tween = this.tweens.add({
      targets: obj,
      alpha: { from: 1, to: 0 },
      duration: 1000,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1, // 无限循环
      onRepeat: () => {
        // 统计动画循环次数
        animationCount++;
      }
    });
    
    // 将tween保存到物体上，方便后续停止
    obj.tween = tween;
  });

  // 添加状态文本显示
  const statusText = this.add.text(400, 50, 'Animation Active: Running', {
    fontSize: '24px',
    color: '#ffffff',
    align: 'center'
  }).setOrigin(0.5);

  const timerText = this.add.text(400, 90, 'Time: 0.0s', {
    fontSize: '20px',
    color: '#ffff00',
    align: 'center'
  }).setOrigin(0.5);

  const countText = this.add.text(400, 120, 'Animation Cycles: 0', {
    fontSize: '18px',
    color: '#00ffff',
    align: 'center'
  }).setOrigin(0.5);

  // 添加说明文本
  this.add.text(400, 550, 'Watch the circles fade in and out synchronously for 4 seconds', {
    fontSize: '16px',
    color: '#aaaaaa',
    align: 'center'
  }).setOrigin(0.5);

  // 记录开始时间
  const startTime = this.time.now;

  // 更新计时器显示
  this.time.addEvent({
    delay: 100,
    callback: () => {
      const elapsed = (this.time.now - startTime) / 1000;
      timerText.setText(`Time: ${elapsed.toFixed(1)}s`);
      countText.setText(`Animation Cycles: ${animationCount}`);
    },
    loop: true
  });

  // 4秒后停止所有动画
  this.time.delayedCall(4000, () => {
    // 停止所有物体的动画
    objects.forEach(obj => {
      if (obj.tween) {
        obj.tween.stop();
        // 将alpha设置为1，确保物体完全可见
        obj.setAlpha(1);
      }
    });

    // 更新状态变量
    animationActive = false;
    
    // 更新状态文本
    statusText.setText('Animation Active: Stopped');
    statusText.setColor('#ff0000');

    // 添加完成提示
    this.add.text(400, 300, 'Animation Completed!', {
      fontSize: '32px',
      color: '#00ff00',
      align: 'center',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    console.log('Animation stopped after 4 seconds');
    console.log('Total animation cycles:', animationCount);
    console.log('Animation active:', animationActive);
  });
}

function update(time, delta) {
  // 可以在这里添加额外的更新逻辑
  // 当前实现中主要逻辑在create中通过tween和timer处理
}

// 启动游戏
new Phaser.Game(config);