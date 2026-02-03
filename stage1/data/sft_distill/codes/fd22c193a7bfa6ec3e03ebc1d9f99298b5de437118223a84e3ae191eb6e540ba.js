// 主游戏场景
class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.isPaused = false;
    this.score = 0;
    this.gameTime = 0;
  }

  preload() {
    // 使用 Graphics 创建纹理，无需外部资源
  }

  create() {
    // 创建玩家方块纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x00ff00, 1);
    graphics.fillRect(0, 0, 40, 40);
    graphics.generateTexture('player', 40, 40);
    graphics.destroy();

    // 创建敌人方块纹理
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0xff0000, 1);
    enemyGraphics.fillRect(0, 0, 30, 30);
    enemyGraphics.generateTexture('enemy', 30, 30);
    enemyGraphics.destroy();

    // 添加玩家
    this.player = this.add.sprite(400, 300, 'player');
    this.player.setOrigin(0.5);

    // 添加移动的敌人（用于验证暂停效果）
    this.enemies = [];
    for (let i = 0; i < 5; i++) {
      const enemy = this.add.sprite(
        100 + i * 150,
        100,
        'enemy'
      );
      enemy.velocityY = 100 + Math.random() * 100;
      this.enemies.push(enemy);
    }

    // 添加分数显示
    this.scoreText = this.add.text(16, 16, 'Score: 0', {
      fontSize: '24px',
      fill: '#ffffff'
    });

    // 添加游戏时间显示
    this.timeText = this.add.text(16, 50, 'Time: 0.0s', {
      fontSize: '24px',
      fill: '#ffffff'
    });

    // 添加状态显示
    this.statusText = this.add.text(16, 84, 'Status: Running', {
      fontSize: '20px',
      fill: '#00ff00'
    });

    // 监听空格键
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    
    // 使用 on 事件监听按键按下
    this.spaceKey.on('down', () => {
      this.togglePause();
    });

    // 添加键盘控制（用于测试暂停效果）
    this.cursors = this.input.keyboard.createCursorKeys();

    console.log('Game started. Press SPACE to pause/resume.');
  }

  update(time, delta) {
    // 更新游戏时间（转换为秒）
    this.gameTime += delta;
    this.timeText.setText(`Time: ${(this.gameTime / 1000).toFixed(1)}s`);

    // 玩家移动
    const speed = 200;
    if (this.cursors.left.isDown) {
      this.player.x -= speed * (delta / 1000);
    } else if (this.cursors.right.isDown) {
      this.player.x += speed * (delta / 1000);
    }
    if (this.cursors.up.isDown) {
      this.player.y -= speed * (delta / 1000);
    } else if (this.cursors.down.isDown) {
      this.player.y += speed * (delta / 1000);
    }

    // 限制玩家在屏幕内
    this.player.x = Phaser.Math.Clamp(this.player.x, 20, 780);
    this.player.y = Phaser.Math.Clamp(this.player.y, 20, 580);

    // 移动敌人
    this.enemies.forEach(enemy => {
      enemy.y += enemy.velocityY * (delta / 1000);
      
      // 敌人到底部后重置
      if (enemy.y > 620) {
        enemy.y = -20;
        this.score += 10;
        this.scoreText.setText(`Score: ${this.score}`);
      }
    });
  }

  togglePause() {
    if (this.isPaused) {
      // 继续游戏
      this.scene.resume();
      this.scene.stop('PauseScene');
      this.isPaused = false;
      this.statusText.setText('Status: Running');
      this.statusText.setColor('#00ff00');
      console.log('Game resumed. Score:', this.score, 'Time:', (this.gameTime / 1000).toFixed(1) + 's');
    } else {
      // 暂停游戏
      this.scene.pause();
      this.scene.launch('PauseScene');
      this.isPaused = true;
      this.statusText.setText('Status: Paused');
      this.statusText.setColor('#ffff00');
      console.log('Game paused. Score:', this.score, 'Time:', (this.gameTime / 1000).toFixed(1) + 's');
    }
  }
}

// 暂停覆盖层场景
class PauseScene extends Phaser.Scene {
  constructor() {
    super('PauseScene');
  }

  preload() {
    // 无需预加载
  }

  create() {
    // 创建半透明黄色背景
    const overlay = this.add.graphics();
    overlay.fillStyle(0xffff00, 0.5);
    overlay.fillRect(0, 0, 800, 600);

    // 创建暗色边框
    overlay.lineStyle(4, 0xff9900, 1);
    overlay.strokeRect(100, 200, 600, 200);

    // 添加 "PAUSED" 文字
    const pausedText = this.add.text(400, 300, 'PAUSED', {
      fontSize: '72px',
      fill: '#ff9900',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 6
    });
    pausedText.setOrigin(0.5);

    // 添加提示文字
    const hintText = this.add.text(400, 380, 'Press SPACE to continue', {
      fontSize: '24px',
      fill: '#ffffff',
      stroke: '#000000',
      strokeThickness: 3
    });
    hintText.setOrigin(0.5);

    // 添加脉动动画效果
    this.tweens.add({
      targets: pausedText,
      scaleX: 1.1,
      scaleY: 1.1,
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    console.log('Pause overlay displayed');
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: [GameScene, PauseScene],
  parent: 'game-container'
};

// 创建游戏实例
const game = new Phaser.Game(config);