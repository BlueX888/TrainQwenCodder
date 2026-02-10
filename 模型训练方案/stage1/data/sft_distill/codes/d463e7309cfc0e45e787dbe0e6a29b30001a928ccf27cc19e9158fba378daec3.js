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

// 验证状态变量
let animationStatus = 'running'; // 可能的值: 'running', 'stopped'
let completedCount = 0; // 记录完成的动画数量

function preload() {
  // 创建3个不同颜色的方块纹理
  const colors = [0xff0000, 0x00ff00, 0x0000ff]; // 红、绿、蓝
  const textureKeys = ['red_box', 'green_box', 'blue_box'];
  
  colors.forEach((color, index) => {
    const graphics = this.add.graphics();
    graphics.fillStyle(color, 1);
    graphics.fillRect(0, 0, 80, 80);
    graphics.generateTexture(textureKeys[index], 80, 80);
    graphics.destroy();
  });
}

function create() {
  // 创建标题文本
  const titleText = this.add.text(400, 50, '同步缩放动画演示', {
    fontSize: '32px',
    color: '#ffffff',
    fontStyle: 'bold'
  }).setOrigin(0.5);

  // 创建状态显示文本
  const statusText = this.add.text(400, 100, '状态: 运行中', {
    fontSize: '24px',
    color: '#ffff00'
  }).setOrigin(0.5);

  // 创建倒计时文本
  const timerText = this.add.text(400, 140, '剩余时间: 2.5s', {
    fontSize: '20px',
    color: '#00ffff'
  }).setOrigin(0.5);

  // 创建3个精灵对象，水平排列
  const sprites = [];
  const textureKeys = ['red_box', 'green_box', 'blue_box'];
  const startX = 200;
  const spacing = 200;
  const yPos = 350;

  for (let i = 0; i < 3; i++) {
    const sprite = this.add.sprite(startX + i * spacing, yPos, textureKeys[i]);
    sprite.setOrigin(0.5);
    sprites.push(sprite);
    
    // 添加标签
    this.add.text(startX + i * spacing, yPos + 80, `物体 ${i + 1}`, {
      fontSize: '18px',
      color: '#ffffff'
    }).setOrigin(0.5);
  }

  // 记录开始时间
  const startTime = Date.now();
  const duration = 2500; // 2.5秒

  // 更新倒计时
  const timerInterval = setInterval(() => {
    const elapsed = Date.now() - startTime;
    const remaining = Math.max(0, (duration - elapsed) / 1000);
    timerText.setText(`剩余时间: ${remaining.toFixed(1)}s`);
    
    if (remaining <= 0) {
      clearInterval(timerInterval);
    }
  }, 100);

  // 为3个物体创建同步的缩放动画
  const tweens = [];
  
  sprites.forEach((sprite, index) => {
    const tween = this.tweens.add({
      targets: sprite,
      scaleX: 1.8,
      scaleY: 1.8,
      duration: 1250, // 单程1.25秒
      ease: 'Sine.easeInOut',
      yoyo: true, // 来回缩放
      repeat: 0, // 只执行一次完整的放大-缩小循环
      onComplete: () => {
        completedCount++;
        console.log(`物体 ${index + 1} 动画完成`);
      }
    });
    
    tweens.push(tween);
  });

  // 2.5秒后停止所有动画
  setTimeout(() => {
    tweens.forEach((tween, index) => {
      if (tween.isPlaying()) {
        tween.stop();
        console.log(`强制停止物体 ${index + 1} 的动画`);
      }
    });
    
    // 更新验证状态
    animationStatus = 'stopped';
    statusText.setText('状态: 已停止');
    statusText.setColor('#ff0000');
    
    // 显示最终信息
    const finalText = this.add.text(400, 500, 
      `动画已停止\n完成数量: ${completedCount}/3\n状态: ${animationStatus}`, {
      fontSize: '20px',
      color: '#00ff00',
      align: 'center'
    }).setOrigin(0.5);
    
    console.log('=== 验证状态 ===');
    console.log('animationStatus:', animationStatus);
    console.log('completedCount:', completedCount);
    console.log('所有动画已停止');
  }, duration);

  // 添加说明文本
  this.add.text(400, 550, '3个物体将同步进行缩放动画，2.5秒后自动停止', {
    fontSize: '16px',
    color: '#aaaaaa'
  }).setOrigin(0.5);

  // 初始日志
  console.log('=== 动画开始 ===');
  console.log('初始状态:', animationStatus);
  console.log('物体数量:', sprites.length);
  console.log('动画持续时间: 2.5秒');
}

// 创建游戏实例
const game = new Phaser.Game(config);

// 导出验证变量（用于测试）
if (typeof window !== 'undefined') {
  window.gameState = {
    getAnimationStatus: () => animationStatus,
    getCompletedCount: () => completedCount
  };
}