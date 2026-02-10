const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create }
};

// 状态信号变量
let animationStatus = 'idle'; // 可能值: 'idle', 'shaking', 'completed'
let shakeCount = 0; // 抖动次数计数器

function preload() {
  // 使用 Graphics 生成三种颜色的纹理
  const graphics = this.add.graphics();
  
  // 红色方块
  graphics.fillStyle(0xff0000, 1);
  graphics.fillRect(0, 0, 80, 80);
  graphics.generateTexture('redBox', 80, 80);
  graphics.clear();
  
  // 绿色方块
  graphics.fillStyle(0x00ff00, 1);
  graphics.fillRect(0, 0, 80, 80);
  graphics.generateTexture('greenBox', 80, 80);
  graphics.clear();
  
  // 蓝色方块
  graphics.fillStyle(0x0000ff, 1);
  graphics.fillRect(0, 0, 80, 80);
  graphics.generateTexture('blueBox', 80, 80);
  
  graphics.destroy();
}

function create() {
  // 创建标题文本
  const title = this.add.text(400, 50, 'Synchronized Shake Animation', {
    fontSize: '28px',
    color: '#ffffff',
    fontStyle: 'bold'
  });
  title.setOrigin(0.5);
  
  // 创建状态显示文本
  const statusText = this.add.text(400, 100, 'Status: Idle', {
    fontSize: '20px',
    color: '#ffff00'
  });
  statusText.setOrigin(0.5);
  
  // 创建计数器文本
  const counterText = this.add.text(400, 130, 'Shake Count: 0', {
    fontSize: '18px',
    color: '#00ffff'
  });
  counterText.setOrigin(0.5);
  
  // 创建三个精灵对象，水平排列
  const sprite1 = this.add.sprite(200, 300, 'redBox');
  const sprite2 = this.add.sprite(400, 300, 'greenBox');
  const sprite3 = this.add.sprite(600, 300, 'blueBox');
  
  // 存储初始位置
  const initialPositions = [
    { x: 200, y: 300 },
    { x: 400, y: 300 },
    { x: 600, y: 300 }
  ];
  
  // 添加标签
  this.add.text(200, 400, 'Red Box', {
    fontSize: '16px',
    color: '#ff6666'
  }).setOrigin(0.5);
  
  this.add.text(400, 400, 'Green Box', {
    fontSize: '16px',
    color: '#66ff66'
  }).setOrigin(0.5);
  
  this.add.text(600, 400, 'Blue Box', {
    fontSize: '16px',
    color: '#6666ff'
  }).setOrigin(0.5);
  
  // 添加提示文本
  const hintText = this.add.text(400, 500, 'Click anywhere to start shaking!', {
    fontSize: '18px',
    color: '#ffffff'
  });
  hintText.setOrigin(0.5);
  
  // 点击开始抖动动画
  this.input.on('pointerdown', () => {
    if (animationStatus === 'idle' || animationStatus === 'completed') {
      // 重置位置
      sprite1.setPosition(initialPositions[0].x, initialPositions[0].y);
      sprite2.setPosition(initialPositions[1].x, initialPositions[1].y);
      sprite3.setPosition(initialPositions[2].x, initialPositions[2].y);
      
      // 更新状态
      animationStatus = 'shaking';
      shakeCount = 0;
      statusText.setText('Status: Shaking');
      counterText.setText('Shake Count: 0');
      hintText.setText('Shaking in progress...');
      
      // 创建同步抖动动画
      const sprites = [sprite1, sprite2, sprite3];
      const tweens = [];
      
      sprites.forEach((sprite, index) => {
        const initialX = initialPositions[index].x;
        const initialY = initialPositions[index].y;
        
        // 为每个精灵创建抖动补间动画
        const tween = this.tweens.add({
          targets: sprite,
          x: {
            value: () => initialX + Phaser.Math.Between(-15, 15),
            duration: 50,
            ease: 'Linear'
          },
          y: {
            value: () => initialY + Phaser.Math.Between(-15, 15),
            duration: 50,
            ease: 'Linear'
          },
          yoyo: false,
          repeat: -1, // 无限重复
          onRepeat: () => {
            if (index === 0) { // 只在第一个物体时计数
              shakeCount++;
              counterText.setText(`Shake Count: ${shakeCount}`);
            }
          }
        });
        
        tweens.push(tween);
      });
      
      // 2.5秒后停止所有动画
      this.time.delayedCall(2500, () => {
        tweens.forEach((tween, index) => {
          tween.stop();
          // 恢复到初始位置
          sprites[index].setPosition(
            initialPositions[index].x,
            initialPositions[index].y
          );
        });
        
        // 更新状态
        animationStatus = 'completed';
        statusText.setText('Status: Completed');
        hintText.setText('Animation completed! Click to restart.');
        
        // 添加完成提示动画
        this.tweens.add({
          targets: [sprite1, sprite2, sprite3],
          scale: { from: 1, to: 1.2 },
          duration: 300,
          yoyo: true,
          ease: 'Sine.easeInOut'
        });
      });
    }
  });
  
  // 添加说明文本
  const instructions = this.add.text(400, 550, 'Animation will last 2.5 seconds', {
    fontSize: '14px',
    color: '#aaaaaa'
  });
  instructions.setOrigin(0.5);
}

new Phaser.Game(config);