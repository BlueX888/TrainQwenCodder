const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create, update }
};

// 全局状态变量（可验证）
let progress = 0;
const maxProgress = 15;

// 游戏对象引用
let progressBar;
let progressText;
let completeText;
let timerEvent;

function preload() {
  // 无需预加载外部资源
}

function create() {
  const centerX = this.cameras.main.width / 2;
  const centerY = this.cameras.main.height / 2;
  
  // 进度条尺寸
  const barWidth = 600;
  const barHeight = 40;
  const barX = centerX - barWidth / 2;
  const barY = centerY - barHeight / 2;
  
  // 创建进度条背景（深灰色）
  const background = this.add.graphics();
  background.fillStyle(0x555555, 1);
  background.fillRect(barX, barY, barWidth, barHeight);
  
  // 创建进度条前景（白色）
  progressBar = this.add.graphics();
  
  // 创建进度文本
  progressText = this.add.text(centerX, barY - 40, '进度: 0 / 15', {
    fontSize: '24px',
    color: '#ffffff',
    fontFamily: 'Arial'
  });
  progressText.setOrigin(0.5);
  
  // 创建完成文本（初始隐藏）
  completeText = this.add.text(centerX, centerY + 80, '✓ 完成！', {
    fontSize: '48px',
    color: '#00ff00',
    fontFamily: 'Arial',
    fontStyle: 'bold'
  });
  completeText.setOrigin(0.5);
  completeText.setVisible(false);
  
  // 创建定时器：每秒增加进度
  timerEvent = this.time.addEvent({
    delay: 1000,              // 每1000毫秒（1秒）
    callback: updateProgress,
    callbackScope: this,
    loop: true                // 循环执行
  });
  
  // 初始绘制进度条
  drawProgressBar(barX, barY, barWidth, barHeight);
}

function update(time, delta) {
  // 每帧更新由 TimerEvent 触发，这里无需额外逻辑
}

/**
 * 更新进度值
 */
function updateProgress() {
  if (progress < maxProgress) {
    progress++;
    
    // 更新进度文本
    progressText.setText(`进度: ${progress} / ${maxProgress}`);
    
    // 检查是否完成
    if (progress >= maxProgress) {
      onProgressComplete();
    }
  }
}

/**
 * 绘制进度条
 */
function drawProgressBar(x, y, width, height) {
  // 清除之前的绘制
  progressBar.clear();
  
  // 计算当前进度宽度
  const progressWidth = (progress / maxProgress) * width;
  
  // 绘制白色进度条
  progressBar.fillStyle(0xffffff, 1);
  progressBar.fillRect(x, y, progressWidth, height);
  
  // 添加进度条边框
  progressBar.lineStyle(2, 0xffffff, 1);
  progressBar.strokeRect(x, y, width, height);
}

/**
 * 进度完成回调
 */
function onProgressComplete() {
  // 停止定时器
  if (timerEvent) {
    timerEvent.remove();
  }
  
  // 显示完成文本
  completeText.setVisible(true);
  
  // 添加完成动画效果
  completeText.setScale(0);
  completeText.scene.tweens.add({
    targets: completeText,
    scale: 1,
    duration: 500,
    ease: 'Back.easeOut'
  });
  
  // 控制台输出验证信息
  console.log('Progress complete! Final value:', progress);
}

// 在 create 函数中需要访问场景的尺寸，所以需要重新组织代码
const config2 = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: {
    preload: function() {},
    create: function() {
      const centerX = this.cameras.main.width / 2;
      const centerY = this.cameras.main.height / 2;
      
      // 进度条尺寸
      const barWidth = 600;
      const barHeight = 40;
      const barX = centerX - barWidth / 2;
      const barY = centerY - barHeight / 2;
      
      // 存储场景引用
      this.progress = 0;
      this.maxProgress = 15;
      this.barX = barX;
      this.barY = barY;
      this.barWidth = barWidth;
      this.barHeight = barHeight;
      
      // 创建进度条背景（深灰色）
      const background = this.add.graphics();
      background.fillStyle(0x555555, 1);
      background.fillRect(barX, barY, barWidth, barHeight);
      
      // 创建进度条前景（白色）
      this.progressBar = this.add.graphics();
      
      // 创建进度文本
      this.progressText = this.add.text(centerX, barY - 40, '进度: 0 / 15', {
        fontSize: '24px',
        color: '#ffffff',
        fontFamily: 'Arial'
      });
      this.progressText.setOrigin(0.5);
      
      // 创建完成文本（初始隐藏）
      this.completeText = this.add.text(centerX, centerY + 80, '✓ 完成！', {
        fontSize: '48px',
        color: '#00ff00',
        fontFamily: 'Arial',
        fontStyle: 'bold'
      });
      this.completeText.setOrigin(0.5);
      this.completeText.setVisible(false);
      
      // 初始绘制进度条
      this.drawProgressBar();
      
      // 创建定时器：每秒增加进度
      this.timerEvent = this.time.addEvent({
        delay: 1000,
        callback: this.updateProgress,
        callbackScope: this,
        loop: true
      });
    },
    
    update: function(time, delta) {
      // 每帧更新进度条显示
      this.drawProgressBar();
    },
    
    updateProgress: function() {
      if (this.progress < this.maxProgress) {
        this.progress++;
        
        // 更新进度文本
        this.progressText.setText(`进度: ${this.progress} / ${this.maxProgress}`);
        
        // 检查是否完成
        if (this.progress >= this.maxProgress) {
          this.onProgressComplete();
        }
      }
    },
    
    drawProgressBar: function() {
      // 清除之前的绘制
      this.progressBar.clear();
      
      // 计算当前进度宽度
      const progressWidth = (this.progress / this.maxProgress) * this.barWidth;
      
      // 绘制白色进度条
      this.progressBar.fillStyle(0xffffff, 1);
      this.progressBar.fillRect(this.barX, this.barY, progressWidth, this.barHeight);
      
      // 添加进度条边框
      this.progressBar.lineStyle(2, 0xffffff, 1);
      this.progressBar.strokeRect(this.barX, this.barY, this.barWidth, this.barHeight);
    },
    
    onProgressComplete: function() {
      // 停止定时器
      if (this.timerEvent) {
        this.timerEvent.remove();
      }
      
      // 显示完成文本
      this.completeText.setVisible(true);
      
      // 添加完成动画效果
      this.completeText.setScale(0);
      this.tweens.add({
        targets: this.completeText,
        scale: 1,
        duration: 500,
        ease: 'Back.easeOut'
      });
      
      // 控制台输出验证信息
      console.log('Progress complete! Final value:', this.progress);
    }
  }
};

new Phaser.Game(config2);