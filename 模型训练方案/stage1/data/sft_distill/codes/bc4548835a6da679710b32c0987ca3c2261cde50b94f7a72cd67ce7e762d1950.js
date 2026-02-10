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

// 全局状态变量
let gameState = {
  animationComplete: false,
  animationDuration: 0,
  objectsCount: 5
};

function preload() {
  // 创建纯色纹理用于显示对象
  const colors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff];
  
  colors.forEach((color, index) => {
    const graphics = this.add.graphics();
    graphics.fillStyle(color, 1);
    graphics.fillCircle(32, 32, 32);
    graphics.generateTexture(`circle${index}`, 64, 64);
    graphics.destroy();
  });
}

function create() {
  // 添加标题文本
  const titleText = this.add.text(400, 50, '同步缩放动画演示', {
    fontSize: '32px',
    color: '#ffffff',
    fontStyle: 'bold'
  });
  titleText.setOrigin(0.5);

  // 状态显示文本
  const statusText = this.add.text(400, 100, '动画状态: 运行中', {
    fontSize: '20px',
    color: '#00ff00'
  });
  statusText.setOrigin(0.5);

  const timerText = this.add.text(400, 130, '已运行时间: 0.0s / 2.5s', {
    fontSize: '18px',
    color: '#ffff00'
  });
  timerText.setOrigin(0.5);

  // 创建5个对象并排列
  const objects = [];
  const startX = 160;
  const spacing = 160;
  const yPos = 350;

  for (let i = 0; i < 5; i++) {
    const obj = this.add.sprite(startX + i * spacing, yPos, `circle${i}`);
    obj.setScale(1);
    objects.push(obj);
    
    // 添加对象标签
    const label = this.add.text(startX + i * spacing, yPos + 80, `对象 ${i + 1}`, {
      fontSize: '16px',
      color: '#ffffff'
    });
    label.setOrigin(0.5);
  }

  // 为所有对象创建同步的缩放动画
  const tweens = [];
  objects.forEach((obj) => {
    const tween = this.tweens.add({
      targets: obj,
      scaleX: 2,
      scaleY: 2,
      duration: 800,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1 // 无限循环
    });
    tweens.push(tween);
  });

  // 计时器：2.5秒后停止所有动画
  let elapsedTime = 0;
  const updateTimer = this.time.addEvent({
    delay: 50,
    callback: () => {
      elapsedTime += 0.05;
      gameState.animationDuration = elapsedTime;
      timerText.setText(`已运行时间: ${elapsedTime.toFixed(1)}s / 2.5s`);
      
      if (elapsedTime >= 2.5) {
        // 停止所有动画
        tweens.forEach(tween => tween.stop());
        
        // 更新状态
        gameState.animationComplete = true;
        statusText.setText('动画状态: 已完成');
        statusText.setColor('#ff0000');
        
        // 停止计时器
        updateTimer.remove();
        
        // 添加完成提示
        const completeText = this.add.text(400, 500, '✓ 动画已停止', {
          fontSize: '24px',
          color: '#00ff00',
          fontStyle: 'bold'
        });
        completeText.setOrigin(0.5);
        completeText.setAlpha(0);
        
        // 完成文字淡入效果
        this.tweens.add({
          targets: completeText,
          alpha: 1,
          duration: 500,
          ease: 'Power2'
        });
        
        console.log('动画完成状态:', gameState);
      }
    },
    loop: true
  });

  // 添加调试信息
  const debugText = this.add.text(10, 10, '', {
    fontSize: '14px',
    color: '#888888'
  });

  // 更新调试信息
  this.time.addEvent({
    delay: 100,
    callback: () => {
      debugText.setText([
        `对象数量: ${gameState.objectsCount}`,
        `动画完成: ${gameState.animationComplete}`,
        `运行时长: ${gameState.animationDuration.toFixed(2)}s`
      ]);
    },
    loop: true
  });

  // 添加说明文字
  const instructionText = this.add.text(400, 550, '观察5个圆形对象的同步缩放动画，2.5秒后自动停止', {
    fontSize: '16px',
    color: '#aaaaaa'
  });
  instructionText.setOrigin(0.5);
}

// 创建游戏实例
const game = new Phaser.Game(config);