const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: {
    preload,
    create,
    update
  }
};

// 全局状态变量（用于验证）
let progress = 0;
let isComplete = false;

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 进度条配置
  const barX = 200;
  const barY = 280;
  const barWidth = 400;
  const barHeight = 40;
  const maxProgress = 15;
  
  // 重置状态
  progress = 0;
  isComplete = false;
  
  // 创建标题文本
  this.add.text(400, 200, '进度条演示', {
    fontSize: '32px',
    color: '#ffffff',
    fontFamily: 'Arial'
  }).setOrigin(0.5);
  
  // 创建进度文本
  const progressText = this.add.text(400, 240, `进度: ${progress} / ${maxProgress}`, {
    fontSize: '20px',
    color: '#ffffff',
    fontFamily: 'Arial'
  }).setOrigin(0.5);
  
  // 创建进度条背景（边框）
  const backgroundGraphics = this.add.graphics();
  backgroundGraphics.lineStyle(3, 0x666666, 1);
  backgroundGraphics.strokeRect(barX, barY, barWidth, barHeight);
  
  // 创建进度条背景填充（深灰色）
  backgroundGraphics.fillStyle(0x333333, 1);
  backgroundGraphics.fillRect(barX, barY, barWidth, barHeight);
  
  // 创建进度条填充（红色）
  const progressBar = this.add.graphics();
  
  // 创建完成文本（初始隐藏）
  const completeText = this.add.text(400, 360, '✓ 完成！', {
    fontSize: '36px',
    color: '#00ff00',
    fontFamily: 'Arial',
    fontStyle: 'bold'
  }).setOrigin(0.5).setVisible(false);
  
  // 创建计时器，每秒增加进度
  const timer = this.time.addEvent({
    delay: 1000,                    // 1秒
    callback: () => {
      if (progress < maxProgress) {
        progress++;
        progressText.setText(`进度: ${progress} / ${maxProgress}`);
        
        // 检查是否完成
        if (progress >= maxProgress) {
          isComplete = true;
          timer.destroy();          // 停止计时器
          completeText.setVisible(true);
          
          // 添加完成动画效果
          this.tweens.add({
            targets: completeText,
            scaleX: 1.2,
            scaleY: 1.2,
            duration: 300,
            yoyo: true,
            repeat: 2
          });
        }
      }
    },
    callbackScope: this,
    loop: true                      // 循环执行
  });
  
  // 存储到场景数据中
  this.progressBar = progressBar;
  this.barX = barX;
  this.barY = barY;
  this.barWidth = barWidth;
  this.barHeight = barHeight;
  this.maxProgress = maxProgress;
  
  // 添加重置按钮
  const resetButton = this.add.text(400, 450, '重置', {
    fontSize: '24px',
    color: '#ffffff',
    backgroundColor: '#4444ff',
    padding: { x: 20, y: 10 },
    fontFamily: 'Arial'
  }).setOrigin(0.5).setInteractive();
  
  resetButton.on('pointerdown', () => {
    // 重置进度
    progress = 0;
    isComplete = false;
    progressText.setText(`进度: ${progress} / ${maxProgress}`);
    completeText.setVisible(false);
    
    // 重启计时器
    timer.reset({
      delay: 1000,
      callback: () => {
        if (progress < maxProgress) {
          progress++;
          progressText.setText(`进度: ${progress} / ${maxProgress}`);
          
          if (progress >= maxProgress) {
            isComplete = true;
            timer.destroy();
            completeText.setVisible(true);
            
            this.tweens.add({
              targets: completeText,
              scaleX: 1.2,
              scaleY: 1.2,
              duration: 300,
              yoyo: true,
              repeat: 2
            });
          }
        }
      },
      callbackScope: this,
      loop: true
    });
  });
  
  resetButton.on('pointerover', () => {
    resetButton.setStyle({ backgroundColor: '#6666ff' });
  });
  
  resetButton.on('pointerout', () => {
    resetButton.setStyle({ backgroundColor: '#4444ff' });
  });
  
  // 添加说明文本
  this.add.text(400, 520, '进度条每秒自动增加1，满15后显示完成', {
    fontSize: '16px',
    color: '#aaaaaa',
    fontFamily: 'Arial'
  }).setOrigin(0.5);
}

function update() {
  // 更新进度条显示
  if (this.progressBar) {
    // 清除之前的绘制
    this.progressBar.clear();
    
    // 计算当前进度宽度
    const fillWidth = (progress / this.maxProgress) * this.barWidth;
    
    // 绘制红色进度条
    this.progressBar.fillStyle(0xff0000, 1);
    this.progressBar.fillRect(this.barX, this.barY, fillWidth, this.barHeight);
    
    // 添加渐变效果（可选）
    if (fillWidth > 0) {
      this.progressBar.fillStyle(0xff6666, 0.5);
      this.progressBar.fillRect(this.barX, this.barY, fillWidth, this.barHeight / 2);
    }
  }
}

// 创建游戏实例
const game = new Phaser.Game(config);

// 导出状态变量供验证使用
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { progress, isComplete };
}