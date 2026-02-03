class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.isPaused = false;
    this.score = 0;
    this.gameTime = 0;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    const { width, height } = this.cameras.main;

    // 创建背景
    const bg = this.add.graphics();
    bg.fillStyle(0x1a1a2e, 1);
    bg.fillRect(0, 0, width, height);

    // 创建移动的游戏对象（用于验证暂停效果）
    this.createMovingObjects();

    // 创建分数显示
    this.scoreText = this.add.text(16, 16, 'Score: 0', {
      fontSize: '24px',
      color: '#ffffff'
    });

    // 创建时间显示
    this.timeText = this.add.text(16, 50, 'Time: 0s', {
      fontSize: '20px',
      color: '#ffffff'
    });

    // 创建暂停覆盖层（初始隐藏）
    this.createPauseOverlay();

    // 监听空格键
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.spaceKey.on('down', () => {
      this.togglePause();
    });

    // 创建提示文本
    this.add.text(width / 2, height - 30, 'Press SPACE to Pause/Resume', {
      fontSize: '18px',
      color: '#aaaaaa'
    }).setOrigin(0.5);

    // 每秒增加分数（用于验证暂停效果）
    this.scoreTimer = this.time.addEvent({
      delay: 1000,
      callback: () => {
        this.score += 10;
        this.scoreText.setText('Score: ' + this.score);
      },
      loop: true
    });
  }

  createMovingObjects() {
    const { width, height } = this.cameras.main;
    
    // 创建多个移动的圆形对象
    this.movingObjects = [];
    
    for (let i = 0; i < 5; i++) {
      const graphics = this.add.graphics();
      const color = Phaser.Display.Color.HSVToRGB(i * 0.2, 1, 1).color;
      graphics.fillStyle(color, 1);
      graphics.fillCircle(0, 0, 20);
      
      const x = 100 + i * 150;
      const y = height / 2;
      graphics.setPosition(x, y);
      
      // 存储速度信息
      graphics.setData('velocityX', 100 + i * 50);
      graphics.setData('velocityY', 50 + i * 30);
      
      this.movingObjects.push(graphics);
    }
  }

  createPauseOverlay() {
    const { width, height } = this.cameras.main;
    
    // 创建容器来管理暂停UI
    this.pauseContainer = this.add.container(0, 0);
    
    // 创建半透明黄色覆盖层
    const overlay = this.add.graphics();
    overlay.fillStyle(0xffdd00, 0.7);
    overlay.fillRect(0, 0, width, height);
    
    // 创建 "PAUSED" 文本
    const pausedText = this.add.text(width / 2, height / 2, 'PAUSED', {
      fontSize: '72px',
      color: '#000000',
      fontStyle: 'bold',
      stroke: '#ffffff',
      strokeThickness: 4
    }).setOrigin(0.5);
    
    // 创建提示文本
    const hintText = this.add.text(width / 2, height / 2 + 80, 'Press SPACE to Resume', {
      fontSize: '24px',
      color: '#000000'
    }).setOrigin(0.5);
    
    // 添加到容器
    this.pauseContainer.add([overlay, pausedText, hintText]);
    
    // 初始隐藏
    this.pauseContainer.setVisible(false);
    
    // 设置深度确保在最上层
    this.pauseContainer.setDepth(1000);
  }

  togglePause() {
    this.isPaused = !this.isPaused;
    
    if (this.isPaused) {
      // 暂停场景
      this.scene.pause();
      // 显示暂停覆盖层
      this.pauseContainer.setVisible(true);
      console.log('Game Paused - Score:', this.score, 'Time:', this.gameTime);
    } else {
      // 继续场景
      this.scene.resume();
      // 隐藏暂停覆盖层
      this.pauseContainer.setVisible(false);
      console.log('Game Resumed - Score:', this.score, 'Time:', this.gameTime);
    }
  }

  update(time, delta) {
    const { width, height } = this.cameras.main;
    
    // 更新游戏时间
    this.gameTime += delta / 1000;
    this.timeText.setText('Time: ' + Math.floor(this.gameTime) + 's');
    
    // 更新移动对象（验证暂停时不会移动）
    this.movingObjects.forEach(obj => {
      const vx = obj.getData('velocityX');
      const vy = obj.getData('velocityY');
      
      obj.x += vx * delta / 1000;
      obj.y += vy * delta / 1000;
      
      // 边界反弹
      if (obj.x < 20 || obj.x > width - 20) {
        obj.setData('velocityX', -vx);
      }
      if (obj.y < 20 || obj.y > height - 20) {
        obj.setData('velocityY', -vy);
      }
    });
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#1a1a2e',
  scene: GameScene,
  parent: 'game-container'
};

// 创建游戏实例
const game = new Phaser.Game(config);

// 导出状态信号用于验证
window.getGameState = function() {
  const scene = game.scene.scenes[0];
  return {
    isPaused: scene.isPaused,
    score: scene.score,
    gameTime: Math.floor(scene.gameTime),
    objectCount: scene.movingObjects ? scene.movingObjects.length : 0
  };
};