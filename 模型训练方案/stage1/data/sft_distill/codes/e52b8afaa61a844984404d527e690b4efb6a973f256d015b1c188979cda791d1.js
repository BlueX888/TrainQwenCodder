const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create, update }
};

// 状态变量
let animationComplete = false;
let animationDuration = 0;
let objects = [];
let tweens = [];

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 重置状态
  animationComplete = false;
  animationDuration = 0;
  objects = [];
  tweens = [];

  // 创建5个不同颜色的矩形物体
  const colors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff];
  const startX = 150;
  const spacing = 130;
  const y = 300;

  for (let i = 0; i < 5; i++) {
    // 使用Graphics绘制矩形
    const graphics = this.add.graphics();
    graphics.fillStyle(colors[i], 1);
    graphics.fillRect(-25, -25, 50, 50); // 以中心为原点绘制50x50的矩形
    
    // 设置位置
    graphics.x = startX + i * spacing;
    graphics.y = y;
    
    objects.push(graphics);

    // 为每个物体创建抖动动画
    const tween = this.tweens.add({
      targets: graphics,
      x: graphics.x + 10, // 向右抖动10像素
      y: graphics.y + 10, // 向下抖动10像素
      duration: 100, // 每次抖动100毫秒
      yoyo: true, // 往复运动
      repeat: 9, // 重复9次（加上初始1次共10次，总计2秒）
      ease: 'Sine.easeInOut',
      onComplete: () => {
        // 当第一个动画完成时，标记所有动画完成
        if (!animationComplete) {
          animationComplete = true;
          console.log('All animations completed after 2 seconds');
        }
      }
    });

    tweens.push(tween);
  }

  // 添加提示文本
  const title = this.add.text(400, 100, '5个物体同步抖动动画', {
    fontSize: '32px',
    color: '#ffffff',
    fontStyle: 'bold'
  });
  title.setOrigin(0.5);

  const statusText = this.add.text(400, 150, '动画进行中...', {
    fontSize: '24px',
    color: '#00ff00'
  });
  statusText.setOrigin(0.5);
  statusText.setName('statusText');

  const timerText = this.add.text(400, 500, '时间: 0.00s / 2.00s', {
    fontSize: '20px',
    color: '#ffffff'
  });
  timerText.setOrigin(0.5);
  timerText.setName('timerText');

  // 添加状态显示
  const stateText = this.add.text(400, 550, '状态: 动画运行中', {
    fontSize: '18px',
    color: '#ffff00'
  });
  stateText.setOrigin(0.5);
  stateText.setName('stateText');
}

function update(time, delta) {
  // 更新动画持续时间
  if (!animationComplete) {
    animationDuration += delta;
    
    // 更新计时器显示
    const timerText = this.children.getByName('timerText');
    if (timerText) {
      const seconds = (animationDuration / 1000).toFixed(2);
      timerText.setText(`时间: ${seconds}s / 2.00s`);
    }

    // 检查是否超过2秒
    if (animationDuration >= 2000) {
      animationComplete = true;
      
      // 停止所有动画
      tweens.forEach(tween => {
        if (tween.isPlaying()) {
          tween.stop();
        }
      });

      console.log('Animation stopped after 2 seconds');
    }
  }

  // 更新状态显示
  const statusText = this.children.getByName('statusText');
  const stateText = this.children.getByName('stateText');
  
  if (animationComplete) {
    if (statusText) {
      statusText.setText('动画已完成！');
      statusText.setColor('#ff0000');
    }
    if (stateText) {
      stateText.setText('状态: 动画已停止');
      stateText.setColor('#ff0000');
    }
  }
}

// 创建游戏实例
new Phaser.Game(config);