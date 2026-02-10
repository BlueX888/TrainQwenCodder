class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.isPaused = false;
    this.score = 0;
    this.gameSpeed = 100;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建程序化纹理 - 玩家方块
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 40, 40);
    playerGraphics.generateTexture('player', 40, 40);
    playerGraphics.destroy();

    // 创建程序化纹理 - 移动的障碍物
    const obstacleGraphics = this.add.graphics();
    obstacleGraphics.fillStyle(0xff0000, 1);
    obstacleGraphics.fillCircle(15, 15, 15);
    obstacleGraphics.generateTexture('obstacle', 30, 30);
    obstacleGraphics.destroy();

    // 创建玩家
    this.player = this.add.sprite(100, 300, 'player');

    // 创建移动的障碍物组
    this.obstacles = this.add.group();
    
    // 创建几个移动的障碍物用于验证暂停效果
    for (let i = 0; i < 3; i++) {
      const obstacle = this.add.sprite(
        300 + i * 200,
        150 + i * 100,
        'obstacle'
      );
      obstacle.setData('speed', this.gameSpeed + i * 20);
      obstacle.setData('direction', i % 2 === 0 ? 1 : -1);
      this.obstacles.add(obstacle);
    }

    // 显示分数
    this.scoreText = this.add.text(16, 16, 'Score: 0', {
      fontSize: '24px',
      fill: '#ffffff',
      fontFamily: 'Arial'
    });

    // 显示游戏速度（用于验证游戏是否在运行）
    this.speedText = this.add.text(16, 50, 'Speed: ' + this.gameSpeed, {
      fontSize: '20px',
      fill: '#ffff00',
      fontFamily: 'Arial'
    });

    // 显示提示信息
    this.instructionText = this.add.text(400, 550, 'Click to Pause/Resume', {
      fontSize: '18px',
      fill: '#cccccc',
      fontFamily: 'Arial'
    });
    this.instructionText.setOrigin(0.5);

    // 创建暂停覆盖层（青色半透明）
    this.pauseOverlay = this.add.graphics();
    this.pauseOverlay.fillStyle(0x00ffff, 0.5);
    this.pauseOverlay.fillRect(0, 0, 800, 600);
    this.pauseOverlay.setDepth(100);
    this.pauseOverlay.setVisible(false);

    // 创建 "PAUSED" 文字
    this.pausedText = this.add.text(400, 300, 'PAUSED', {
      fontSize: '72px',
      fill: '#ffffff',
      fontFamily: 'Arial',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 6
    });
    this.pausedText.setOrigin(0.5);
    this.pausedText.setDepth(101);
    this.pausedText.setVisible(false);

    // 添加鼠标左键点击事件监听
    this.input.on('pointerdown', (pointer) => {
      // 只响应左键
      if (pointer.leftButtonDown()) {
        this.togglePause();
      }
    });

    // 创建定时器用于增加分数（验证游戏是否暂停）
    this.scoreTimer = this.time.addEvent({
      delay: 1000,
      callback: this.incrementScore,
      callbackScope: this,
      loop: true
    });
  }

  update(time, delta) {
    // 移动障碍物（验证暂停效果）
    this.obstacles.children.entries.forEach(obstacle => {
      const speed = obstacle.getData('speed');
      const direction = obstacle.getData('direction');
      
      obstacle.x += speed * delta / 1000 * direction;

      // 边界检测并反向
      if (obstacle.x > 800) {
        obstacle.x = 800;
        obstacle.setData('direction', -1);
      } else if (obstacle.x < 0) {
        obstacle.x = 0;
        obstacle.setData('direction', 1);
      }
    });

    // 玩家简单上下移动（验证游戏在运行）
    this.player.y = 300 + Math.sin(time / 500) * 100;
  }

  togglePause() {
    this.isPaused = !this.isPaused;

    if (this.isPaused) {
      // 暂停游戏场景
      this.scene.pause();
      
      // 显示暂停覆盖层
      this.pauseOverlay.setVisible(true);
      this.pausedText.setVisible(true);
      
      // 暂停定时器
      this.scoreTimer.paused = true;
      
      console.log('Game Paused - Score:', this.score);
    } else {
      // 恢复游戏场景
      this.scene.resume();
      
      // 隐藏暂停覆盖层
      this.pauseOverlay.setVisible(false);
      this.pausedText.setVisible(false);
      
      // 恢复定时器
      this.scoreTimer.paused = false;
      
      console.log('Game Resumed - Score:', this.score);
    }
  }

  incrementScore() {
    this.score += 10;
    this.scoreText.setText('Score: ' + this.score);
    
    // 每20分增加游戏速度
    if (this.score % 20 === 0) {
      this.gameSpeed += 10;
      this.speedText.setText('Speed: ' + this.gameSpeed);
    }
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: GameScene,
  parent: 'game-container'
};

// 创建游戏实例
const game = new Phaser.Game(config);