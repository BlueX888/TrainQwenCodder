const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create, update }
};

// 游戏状态变量（可验证）
let gameState = {
  isBlinking: false,
  blinkCount: 0,
  objectsCreated: 0,
  animationStopped: false
};

let objects = [];
let tweens = [];

function preload() {
  // 使用Graphics创建圆形纹理，避免外部资源依赖
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1);
  graphics.fillCircle(25, 25, 25);
  graphics.generateTexture('circle', 50, 50);
  graphics.destroy();
}

function create() {
  // 创建标题文本
  this.add.text(400, 50, '15个物体同步闪烁动画', {
    fontSize: '28px',
    color: '#ffffff'
  }).setOrigin(0.5);

  // 创建状态显示文本
  const statusText = this.add.text(400, 100, '', {
    fontSize: '18px',
    color: '#ffff00'
  }).setOrigin(0.5);

  // 创建15个物体，排列成3行5列
  const rows = 3;
  const cols = 5;
  const startX = 200;
  const startY = 200;
  const spacingX = 100;
  const spacingY = 100;

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const x = startX + col * spacingX;
      const y = startY + row * spacingY;
      
      // 创建精灵对象
      const obj = this.add.sprite(x, y, 'circle');
      objects.push(obj);
      gameState.objectsCreated++;
    }
  }

  // 启动同步闪烁动画
  gameState.isBlinking = true;
  
  objects.forEach((obj, index) => {
    // 为每个物体创建alpha闪烁tween
    const tween = this.tweens.add({
      targets: obj,
      alpha: 0.2,  // 闪烁到半透明
      duration: 300,  // 单次闪烁持续300ms
      yoyo: true,  // 来回闪烁
      repeat: -1,  // 无限重复
      ease: 'Sine.easeInOut',
      onRepeat: () => {
        // 只在第一个物体上计数，避免重复计数
        if (index === 0) {
          gameState.blinkCount++;
        }
      }
    });
    
    tweens.push(tween);
  });

  // 2.5秒后停止所有闪烁动画
  this.time.delayedCall(2500, () => {
    tweens.forEach(tween => {
      tween.stop();
    });
    
    // 恢复所有物体的完全不透明状态
    objects.forEach(obj => {
      obj.setAlpha(1);
    });
    
    gameState.isBlinking = false;
    gameState.animationStopped = true;
    
    statusText.setText('动画已停止！');
    statusText.setColor('#00ff00');
    
    console.log('动画状态:', gameState);
  });

  // 更新状态显示
  this.time.addEvent({
    delay: 100,
    callback: () => {
      if (gameState.isBlinking) {
        statusText.setText(`闪烁中... 次数: ${gameState.blinkCount}`);
      }
    },
    loop: true
  });

  // 添加说明文本
  this.add.text(400, 550, '动画将在2.5秒后自动停止', {
    fontSize: '16px',
    color: '#aaaaaa'
  }).setOrigin(0.5);

  console.log('初始状态:', gameState);
}

function update(time, delta) {
  // 可以在这里添加额外的更新逻辑
}

// 创建游戏实例
new Phaser.Game(config);