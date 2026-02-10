class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.platformsPassed = 0;
    this.survivalTime = 0;
    this.isGameOver = false;
  }

  preload() {
    // 使用 Graphics 生成纹理，无需外部资源
  }

  create() {
    // 创建玩家纹理
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建平台纹理
    const platformGraphics = this.add.graphics();
    platformGraphics.fillStyle(0xff6600, 1);
    platformGraphics.fillRect(0, 0, 120, 20);
    platformGraphics.generateTexture('platform', 120, 20);
    platformGraphics.destroy();

    // 创建玩家
    this.player = this.physics.add.sprite(100, 300, 'player');
    this.player.setBounce(0);
    this.player.setCollideWorldBounds(false);
    this.player.setGravityY(800);

    // 创建平台组
    this.platforms = this.physics.add.staticGroup();

    // 创建15个移动平台，形成路径
    this.movingPlatforms = [];
    const platformConfig = [
      { x: 100, y: 400, direction: 1 },
      { x: 250, y: 380, direction: -1 },
      { x: 400, y: 360, direction: 1 },
      { x: 550, y: 340, direction: -1 },
      { x: 700, y: 320, direction: 1 },
      { x: 200, y: 300, direction: -1 },
      { x: 350, y: 280, direction: 1 },
      { x: 500, y: 260, direction: -1 },
      { x: 650, y: 240, direction: 1 },
      { x: 150, y: 220, direction: -1 },
      { x: 300, y: 200, direction: 1 },
      { x: 450, y: 180, direction: -1 },
      { x: 600, y: 160, direction: 1 },
      { x: 250, y: 140, direction: -1 },
      { x: 400, y: 120, direction: 1 }
    ];

    platformConfig.forEach((config, index) => {
      const platform = this.physics.add.image(config.x, config.y, 'platform');
      platform.setImmovable(true);
      platform.body.allowGravity = false;
      platform.body.setVelocityX(240 * config.direction);
      
      // 存储平台信息
      platform.setData('direction', config.direction);
      platform.setData('index', index);
      platform.setData('minX', 50);
      platform.setData('maxX', 750);
      platform.setData('passed', false);
      
      this.movingPlatforms.push(platform);
    });

    // 添加碰撞检测
    this.physics.add.collider(this.player, this.movingPlatforms, this.onPlatformCollide, null, this);

    // 键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // UI文本
    this.scoreText = this.add.text(16, 16, 'Platforms Passed: 0', {
      fontSize: '20px',
      fill: '#ffffff'
    });

    this.timeText = this.add.text(16, 46, 'Time: 0s', {
      fontSize: '20px',
      fill: '#ffffff'
    });

    this.statusText = this.add.text(400, 300, '', {
      fontSize: '32px',
      fill: '#ff0000',
      align: 'center'
    }).setOrigin(0.5);

    // 初始化计时器
    this.startTime = this.time.now;

    // 添加地面平台用于初始站立
    const ground = this.physics.add.sprite(100, 450, 'platform');
    ground.setImmovable(true);
    ground.body.allowGravity = false;
    ground.body.setVelocityX(0);
    this.physics.add.collider(this.player, ground);
  }

  onPlatformCollide(player, platform) {
    // 检测玩家是否通过平台（从上方落到平台上）
    if (player.body.touching.down && !platform.getData('passed')) {
      platform.setData('passed', true);
      this.platformsPassed++;
      this.scoreText.setText('Platforms Passed: ' + this.platformsPassed);

      // 检查是否通过所有平台
      if (this.platformsPassed >= 15) {
        this.gameWin();
      }
    }
  }

  update(time, delta) {
    if (this.isGameOver) {
      return;
    }

    // 更新存活时间
    this.survivalTime = Math.floor((time - this.startTime) / 1000);
    this.timeText.setText('Time: ' + this.survivalTime + 's');

    // 玩家左右移动
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-200);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(200);
    } else {
      this.player.setVelocityX(0);
    }

    // 跳跃（空格键或上键）
    if ((Phaser.Input.Keyboard.JustDown(this.spaceKey) || 
         Phaser.Input.Keyboard.JustDown(this.cursors.up)) && 
        this.player.body.touching.down) {
      this.player.setVelocityY(-500);
    }

    // 更新移动平台
    this.movingPlatforms.forEach(platform => {
      const direction = platform.getData('direction');
      const minX = platform.getData('minX');
      const maxX = platform.getData('maxX');

      // 平台边界反弹
      if (platform.x <= minX) {
        platform.setData('direction', 1);
        platform.body.setVelocityX(240);
      } else if (platform.x >= maxX) {
        platform.setData('direction', -1);
        platform.body.setVelocityX(-240);
      }
    });

    // 检测玩家掉落
    if (this.player.y > 650) {
      this.gameOver();
    }

    // 检测玩家是否到达顶部（胜利条件）
    if (this.player.y < 50 && this.platformsPassed >= 15) {
      this.gameWin();
    }
  }

  gameOver() {
    if (this.isGameOver) return;
    
    this.isGameOver = true;
    this.physics.pause();
    this.player.setTint(0xff0000);
    this.statusText.setText('GAME OVER!\nPlatforms: ' + this.platformsPassed + '\nTime: ' + this.survivalTime + 's\nPress R to Restart');
    
    // 重启键
    this.input.keyboard.once('keydown-R', () => {
      this.scene.restart();
    });
  }

  gameWin() {
    if (this.isGameOver) return;
    
    this.isGameOver = true;
    this.physics.pause();
    this.player.setTint(0x00ff00);
    this.statusText.setText('YOU WIN!\nAll 15 Platforms Passed!\nTime: ' + this.survivalTime + 's\nPress R to Restart');
    
    // 重启键
    this.input.keyboard.once('keydown-R', () => {
      this.scene.restart();
    });
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: GameScene
};

new Phaser.Game(config);