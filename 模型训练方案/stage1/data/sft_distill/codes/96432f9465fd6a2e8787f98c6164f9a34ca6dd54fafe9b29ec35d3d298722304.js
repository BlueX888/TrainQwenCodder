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

// 状态信号变量
let animationStatus = 'running'; // 可能值: 'running', 'completed'
let blinkCount = 0; // 记录闪烁次数
let objectsCreated = 0; // 记录创建的物体数量

function preload() {
  // 不需要加载外部资源
}

function create() {
  const objects = [];
  const objectCount = 15;
  
  // 添加标题文本
  const titleText = this.add.text(400, 50, '15个物体同步闪烁动画', {
    fontSize: '28px',
    color: '#ffffff',
    fontFamily: 'Arial'
  }).setOrigin(0.5);
  
  // 添加状态显示文本
  const statusText = this.add.text(400, 100, '状态: 运行中', {
    fontSize: '20px',
    color: '#00ff00',
    fontFamily: 'Arial'
  }).setOrigin(0.5);
  
  const countText = this.add.text(400, 130, '闪烁次数: 0', {
    fontSize: '18px',
    color: '#ffff00',
    fontFamily: 'Arial'
  }).setOrigin(0.5);
  
  // 创建15个图形对象（排列成3行5列）
  const rows = 3;
  const cols = 5;
  const startX = 200;
  const startY = 200;
  const spacingX = 100;
  const spacingY = 100;
  const radius = 30;
  
  for (let i = 0; i < objectCount; i++) {
    const row = Math.floor(i / cols);
    const col = i % cols;
    const x = startX + col * spacingX;
    const y = startY + row * spacingY;
    
    // 创建图形对象
    const graphics = this.add.graphics();
    graphics.fillStyle(0x00aaff, 1);
    graphics.fillCircle(x, y, radius);
    
    // 添加编号文本
    const numberText = this.add.text(x, y, (i + 1).toString(), {
      fontSize: '16px',
      color: '#ffffff',
      fontFamily: 'Arial',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    
    objects.push({ graphics, numberText });
    objectsCreated++;
  }
  
  console.log(`创建了 ${objectsCreated} 个物体`);
  
  // 为所有物体创建同步的闪烁动画
  const tweens = [];
  
  objects.forEach(obj => {
    // 为图形对象创建闪烁动画
    const graphicsTween = this.tweens.add({
      targets: obj.graphics,
      alpha: { from: 1, to: 0.1 },
      duration: 400,
      yoyo: true,
      repeat: -1, // 无限循环
      ease: 'Sine.easeInOut',
      onRepeat: () => {
        // 只在第一个物体上计数，避免重复计数
        if (obj === objects[0]) {
          blinkCount++;
          countText.setText(`闪烁次数: ${blinkCount}`);
        }
      }
    });
    
    // 为文本创建闪烁动画
    const textTween = this.tweens.add({
      targets: obj.numberText,
      alpha: { from: 1, to: 0.3 },
      duration: 400,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
    
    tweens.push(graphicsTween, textTween);
  });
  
  console.log('所有闪烁动画已启动');
  
  // 2.5秒后停止所有动画
  this.time.delayedCall(2500, () => {
    // 停止所有 tween
    tweens.forEach(tween => {
      tween.stop();
    });
    
    // 恢复所有物体的完全不透明状态
    objects.forEach(obj => {
      obj.graphics.setAlpha(1);
      obj.numberText.setAlpha(1);
    });
    
    // 更新状态
    animationStatus = 'completed';
    statusText.setText('状态: 已完成');
    statusText.setColor('#ff0000');
    
    console.log(`动画已停止。最终状态: ${animationStatus}, 总闪烁次数: ${blinkCount}`);
    
    // 添加完成提示
    const completeText = this.add.text(400, 550, '✓ 动画已完成！', {
      fontSize: '24px',
      color: '#00ff00',
      fontFamily: 'Arial',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    
    // 完成文本的淡入效果
    completeText.setAlpha(0);
    this.tweens.add({
      targets: completeText,
      alpha: 1,
      duration: 500,
      ease: 'Power2'
    });
  });
  
  // 添加说明文本
  this.add.text(400, 560, '动画将在2.5秒后自动停止', {
    fontSize: '14px',
    color: '#888888',
    fontFamily: 'Arial'
  }).setOrigin(0.5);
}

// 创建游戏实例
const game = new Phaser.Game(config);

// 导出状态变量供验证使用
window.gameStatus = {
  getAnimationStatus: () => animationStatus,
  getBlinkCount: () => blinkCount,
  getObjectsCreated: () => objectsCreated
};

console.log('游戏已启动，15个物体将同步闪烁2.5秒');