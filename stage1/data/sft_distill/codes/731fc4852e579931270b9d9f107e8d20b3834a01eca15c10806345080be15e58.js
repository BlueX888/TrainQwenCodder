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

// 状态变量
let animationComplete = false;
let rotationTweens = [];

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 创建3个不同颜色的纹理
  const colors = [0xff0000, 0x00ff00, 0x0000ff]; // 红、绿、蓝
  const textureKeys = ['rect1', 'rect2', 'rect3'];
  
  colors.forEach((color, index) => {
    const graphics = this.add.graphics();
    graphics.fillStyle(color, 1);
    graphics.fillRect(0, 0, 80, 80);
    graphics.generateTexture(textureKeys[index], 80, 80);
    graphics.destroy();
  });

  // 创建3个精灵对象，水平排列
  const sprites = [];
  const startX = 250;
  const spacing = 150;
  const y = 300;

  for (let i = 0; i < 3; i++) {
    const sprite = this.add.sprite(startX + i * spacing, y, textureKeys[i]);
    sprite.setOrigin(0.5, 0.5);
    sprites.push(sprite);
  }

  // 为每个精灵添加旋转动画（同步）
  sprites.forEach(sprite => {
    const tween = this.tweens.add({
      targets: sprite,
      angle: 360, // 旋转360度
      duration: 4000, // 持续4秒
      ease: 'Linear',
      repeat: -1, // 无限循环（将在4秒后手动停止）
      onStart: () => {
        console.log('Rotation animation started');
      }
    });
    rotationTweens.push(tween);
  });

  // 添加文本显示状态
  const statusText = this.add.text(400, 100, 'Animation Running...', {
    fontSize: '24px',
    color: '#ffffff',
    align: 'center'
  });
  statusText.setOrigin(0.5, 0.5);

  // 添加倒计时文本
  const timerText = this.add.text(400, 150, 'Time: 4.0s', {
    fontSize: '20px',
    color: '#ffff00',
    align: 'center'
  });
  timerText.setOrigin(0.5, 0.5);

  // 倒计时更新
  let elapsedTime = 0;
  const timerEvent = this.time.addEvent({
    delay: 100, // 每0.1秒更新一次
    callback: () => {
      elapsedTime += 0.1;
      const remaining = Math.max(0, 4.0 - elapsedTime);
      timerText.setText(`Time: ${remaining.toFixed(1)}s`);
    },
    repeat: 39 // 4秒 = 40次 * 0.1秒
  });

  // 4秒后停止所有旋转动画
  this.time.delayedCall(4000, () => {
    // 停止所有 tweens
    rotationTweens.forEach(tween => {
      tween.stop();
    });
    
    // 更新状态
    animationComplete = true;
    statusText.setText('Animation Complete!');
    statusText.setColor('#00ff00');
    
    console.log('All rotation animations stopped after 4 seconds');
    console.log('Animation complete status:', animationComplete);
  });

  // 添加说明文本
  const instructionText = this.add.text(400, 500, 
    '3 objects rotating synchronously\nWill stop after 4 seconds', {
    fontSize: '16px',
    color: '#aaaaaa',
    align: 'center'
  });
  instructionText.setOrigin(0.5, 0.5);
}

// 创建游戏实例
new Phaser.Game(config);