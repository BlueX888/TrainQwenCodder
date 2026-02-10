class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.obstacleCount = 0; // 可验证状态变量
    this.currentSeed = null;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 设置固定种子以确保确定性生成
    this.currentSeed = ['phaser3', 'deterministic', 'layout', '2024'];
    this.game.config.seed = this.currentSeed;
    
    // 重新初始化随机数生成器
    Phaser.Math.RND.sow(this.currentSeed);
    
    // 显示背景
    const bg = this.add.graphics();
    bg.fillStyle(0x1a1a2e, 1);
    bg.fillRect(0, 0, 800, 600);
    
    // 显示 seed 信息
    const seedText = this.add.text(20, 20, `Seed: ${this.currentSeed.join('-')}`, {
      fontSize: '18px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    seedText.setDepth(100);
    
    // 显示障碍物计数
    this.countText = this.add.text(20, 60, `Obstacles: 0/15`, {
      fontSize: '18px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.countText.setDepth(100);
    
    // 生成 15 个粉色障碍物
    this.obstacles = [];
    const minSize = 30;
    const maxSize = 80;
    const margin = 100; // 边界边距
    const minDistance = 60; // 障碍物之间的最小距离
    
    // 使用确定性随机生成障碍物
    for (let i = 0; i < 15; i++) {
      let x, y, width, height;
      let attempts = 0;
      let validPosition = false;
      
      // 尝试找到一个不重叠的位置
      while (!validPosition && attempts < 100) {
        x = Phaser.Math.RND.between(margin, 800 - margin);
        y = Phaser.Math.RND.between(margin + 100, 600 - margin);
        width = Phaser.Math.RND.between(minSize, maxSize);
        height = Phaser.Math.RND.between(minSize, maxSize);
        
        // 检查是否与现有障碍物重叠
        validPosition = true;
        for (let obstacle of this.obstacles) {
          const dx = Math.abs(x - obstacle.x);
          const dy = Math.abs(y - obstacle.y);
          const minDist = (width + obstacle.width) / 2 + minDistance;
          
          if (dx < minDist && dy < minDist) {
            validPosition = false;
            break;
          }
        }
        
        attempts++;
      }
      
      // 创建障碍物
      const obstacle = this.createObstacle(x, y, width, height, i);
      this.obstacles.push(obstacle);
      this.obstacleCount++;
    }
    
    // 更新计数显示
    this.countText.setText(`Obstacles: ${this.obstacleCount}/15`);
    
    // 添加说明文本
    this.add.text(400, 560, 'Fixed seed ensures same layout every time', {
      fontSize: '16px',
      color: '#aaaaaa',
      align: 'center'
    }).setOrigin(0.5);
    
    // 添加重新生成按钮（使用相同 seed）
    const resetButton = this.add.text(700, 20, 'Reset', {
      fontSize: '18px',
      color: '#ffffff',
      backgroundColor: '#ff1493',
      padding: { x: 15, y: 8 }
    });
    resetButton.setInteractive({ useHandCursor: true });
    resetButton.on('pointerdown', () => {
      this.scene.restart();
    });
    resetButton.on('pointerover', () => {
      resetButton.setBackgroundColor('#ff69b4');
    });
    resetButton.on('pointerout', () => {
      resetButton.setBackgroundColor('#ff1493');
    });
    
    // 验证确定性：输出障碍物位置到控制台
    console.log('=== Obstacle Layout (Deterministic) ===');
    this.obstacles.forEach((obs, idx) => {
      console.log(`Obstacle ${idx + 1}: x=${obs.x.toFixed(2)}, y=${obs.y.toFixed(2)}, w=${obs.width.toFixed(2)}, h=${obs.height.toFixed(2)}`);
    });
    console.log(`Total obstacles: ${this.obstacleCount}`);
  }
  
  createObstacle(x, y, width, height, index) {
    const graphics = this.add.graphics();
    
    // 粉色填充
    graphics.fillStyle(0xff1493, 1);
    graphics.fillRect(-width / 2, -height / 2, width, height);
    
    // 深粉色边框
    graphics.lineStyle(3, 0xc71585, 1);
    graphics.strokeRect(-width / 2, -height / 2, width, height);
    
    // 设置位置
    graphics.setPosition(x, y);
    
    // 添加编号文本
    const label = this.add.text(x, y, `${index + 1}`, {
      fontSize: '14px',
      color: '#ffffff',
      fontStyle: 'bold'
    });
    label.setOrigin(0.5);
    label.setDepth(10);
    
    // 添加轻微的脉动动画（确定性）
    this.tweens.add({
      targets: graphics,
      scaleX: 1.05,
      scaleY: 1.05,
      duration: 1000 + (index * 50), // 基于索引的确定性时长
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
    
    // 返回障碍物信息
    return {
      graphics: graphics,
      label: label,
      x: x,
      y: y,
      width: width,
      height: height,
      index: index
    };
  }
  
  update(time, delta) {
    // 不需要每帧更新逻辑
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#1a1a2e',
  scene: GameScene,
  seed: ['phaser3', 'deterministic', 'layout', '2024'] // 全局固定种子
};

// 启动游戏
const game = new Phaser.Game(config);