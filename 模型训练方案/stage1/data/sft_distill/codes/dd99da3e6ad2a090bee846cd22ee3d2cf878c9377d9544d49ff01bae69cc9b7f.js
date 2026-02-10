class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.jumpCount = 0;
    this.platformsPassed = 0;
    this.isOnPlatform = false;
  }

  preload() {
    // 创建玩家纹理
    const playerGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建平台纹理
    const platformGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    platformGraphics.fillStyle(0xff6600, 1);
    platformGraphics.fillRect(0, 0, 120, 20);
    platformGraphics.generateTexture('platform', 120, 20);
    platformGraphics.destroy();

    // 创建地面纹理
    const groundGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    groundGraphics.fillStyle(0x8b4513, 1);
    groundGraphics.fillRect(0, 0, 800, 40);
    groundGraphics.generateTexture('ground', 800, 40);
    groundGraphics.destroy();
  }

  create() {
    // 添加背景色
    this.cameras.main.setBackgroundColor('#87ceeb');

    // 创建地面
    this.ground = this.physics.add.staticSprite(400, 580, 'ground');

    // 创建玩家
    this.player = this.physics.add.sprite(100, 500, 'player');
    this.player.setBounce(0);
    this.player.setCollideWorldBounds(true);
    this.player.body.setGravityY(800);

    // 创建移动平台组
    this.platforms = this.physics.add.group({
      allowGravity: false,
      immovable: true
    });

    // 平台配置：位置和移动路径
    const platformConfigs = [
      { startX: 200, startY: 450, endX: 400, endY: 450 },
      { startX: 450, startY: 350, endX: 250, endY: 350 },
      { startX: 300, startY: 250, endX: 500, endY: 250 }
    ];

    // 创建3个移动平台
    platformConfigs.forEach((config, index) => {
      const platform = this.platforms.create(config.startX, config.startY, 'platform');
      platform.body.setSize(120, 20);
      platform.setData('config', config);
      platform.setData('direction', 1); // 1: 向右/向终点, -1: 向左/向起点
      platform.setData('index', index);
      platform.setData('passed', false);
    });

    // 添加碰撞检测
    this.physics.add.collider(this.player, this.ground);
    this.physics.add.collider(this.player, this.platforms, this.onPlatformCollision, null, this);

    // 键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // 显示状态信息
    this.statusText = this.add.text(16, 16, '', {
      fontSize: '18px',
      fill: '#000',
      backgroundColor: '#fff',
      padding: { x: 10, y: 5 }
    });

    this.updateStatusText();

    // 添加说明文本
    this.add.text(400, 100, '使用方向键移动，空格键跳跃', {
      fontSize: '20px',
      fill: '#000',
      backgroundColor: '#fff',
      padding: { x: 10, y: 5 }
    }).setOrigin(0.5);

    this.add.text(400, 140, '目标：跳跃通过所有3个移动平台！', {
      fontSize: '16px',
      fill: '#000',
      backgroundColor: '#fff',
      padding: { x: 10, y: 5 }
    }).setOrigin(0.5);
  }

  onPlatformCollision(player, platform) {
    // 只有当玩家从上方落到平台时才标记为站在平台上
    if (player.body.touching.down && platform.body.touching.up) {
      this.isOnPlatform = true;
      
      // 检查是否首次通过此平台
      const index = platform.getData('index');
      const passed = platform.getData('passed');
      
      if (!passed) {
        platform.setData('passed', true);
        this.platformsPassed++;
        this.updateStatusText();
        
        // 平台变色表示已通过
        platform.setTint(0x00ff00);
        
        // 检查是否通过所有平台
        if (this.platformsPassed >= 3) {
          this.showVictory();
        }
      }
    }
  }

  update(time, delta) {
    // 更新平台移动
    this.platforms.getChildren().forEach(platform => {
      const config = platform.getData('config');
      const direction = platform.getData('direction');
      const speed = 160;

      // 计算移动方向
      const dx = config.endX - config.startX;
      const dy = config.endY - config.startY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance > 0) {
        const vx = (dx / distance) * speed * direction;
        const vy = (dy / distance) * speed * direction;
        
        platform.body.setVelocity(vx, vy);

        // 检查是否到达终点或起点
        if (direction === 1) {
          // 向终点移动
          const distToEnd = Phaser.Math.Distance.Between(
            platform.x, platform.y, config.endX, config.endY
          );
          if (distToEnd < 5) {
            platform.setPosition(config.endX, config.endY);
            platform.setData('direction', -1);
          }
        } else {
          // 向起点移动
          const distToStart = Phaser.Math.Distance.Between(
            platform.x, platform.y, config.startX, config.startY
          );
          if (distToStart < 5) {
            platform.setPosition(config.startX, config.startY);
            platform.setData('direction', 1);
          }
        }
      }
    });

    // 重置站在平台状态
    this.isOnPlatform = false;

    // 玩家左右移动
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-200);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(200);
    } else {
      this.player.setVelocityX(0);
    }

    // 跳跃控制
    if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
      // 在地面或平台上可以跳跃
      if (this.player.body.touching.down) {
        this.player.setVelocityY(-400);
        this.jumpCount++;
        this.updateStatusText();
      }
    }

    // 检查玩家是否掉落
    if (this.player.y > 600) {
      this.resetPlayer();
    }
  }

  updateStatusText() {
    this.statusText.setText(
      `跳跃次数: ${this.jumpCount}\n` +
      `通过平台: ${this.platformsPassed}/3`
    );
  }

  resetPlayer() {
    this.player.setPosition(100, 500);
    this.player.setVelocity(0, 0);
  }

  showVictory() {
    // 显示胜利信息
    const victoryText = this.add.text(400, 300, '恭喜通关！', {
      fontSize: '48px',
      fill: '#fff',
      backgroundColor: '#000',
      padding: { x: 20, y: 10 }
    }).setOrigin(0.5);

    const statsText = this.add.text(400, 360, `总跳跃次数: ${this.jumpCount}`, {
      fontSize: '24px',
      fill: '#fff',
      backgroundColor: '#000',
      padding: { x: 15, y: 8 }
    }).setOrigin(0.5);

    // 暂停物理系统
    this.physics.pause();
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
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