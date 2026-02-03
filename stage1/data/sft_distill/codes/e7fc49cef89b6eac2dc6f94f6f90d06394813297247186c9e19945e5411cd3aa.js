class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.currentLevel = 1;
    this.maxLevel = 5;
    this.baseEnemyCount = 12;
    this.enemyIncrement = 2;
    this.score = 0;
    this.enemiesRemaining = 0;
  }

  preload() {
    // 创建玩家纹理
    const playerGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillTriangle(16, 0, 0, 32, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建敌人纹理
    const enemyGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    enemyGraphics.fillStyle(0x808080, 1);
    enemyGraphics.fillRect(0, 0, 30, 30);
    enemyGraphics.generateTexture('enemy', 30, 30);
    enemyGraphics.destroy();

    // 创建子弹纹理
    const bulletGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    bulletGraphics.fillStyle(0xffff00, 1);
    bulletGraphics.fillCircle(4, 4, 4);
    bulletGraphics.generateTexture('bullet', 8, 8);
    bulletGraphics.destroy();
  }

  create() {
    // 初始化物理系统
    this.physics.world.setBounds(0, 0, 800, 600);

    // 创建玩家
    this.player = this.physics.add.sprite(400, 550, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建子弹组
    this.bullets = this.physics.add.group({
      defaultKey: 'bullet',
      maxSize: 20
    });

    // 创建敌人组
    this.enemies = this.physics.add.group();

    // 键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.canShoot = true;

    // 碰撞检测
    this.physics.add.overlap(this.bullets, this.enemies, this.hitEnemy, null, this);

    // UI文本
    this.levelText = this.add.text(16, 16, '', {
      fontSize: '24px',
      fill: '#ffffff'
    });

    this.enemyCountText = this.add.text(16, 50, '', {
      fontSize: '20px',
      fill: '#ffffff'
    });

    this.scoreText = this.add.text(16, 80, '', {
      fontSize: '20px',
      fill: '#ffffff'
    });

    this.messageText = this.add.text(400, 300, '', {
      fontSize: '32px',
      fill: '#00ff00',
      align: 'center'
    }).setOrigin(0.5);

    // 开始第一关
    this.startLevel();
  }

  startLevel() {
    // 清空敌人
    this.enemies.clear(true, true);

    // 计算当前关卡敌人数量
    const enemyCount = this.baseEnemyCount + (this.currentLevel - 1) * this.enemyIncrement;
    this.enemiesRemaining = enemyCount;

    // 生成敌人（网格布局）
    const rows = Math.ceil(Math.sqrt(enemyCount));
    const cols = Math.ceil(enemyCount / rows);
    const startX = 100;
    const startY = 80;
    const spacingX = 80;
    const spacingY = 60;

    let enemiesCreated = 0;
    for (let row = 0; row < rows && enemiesCreated < enemyCount; row++) {
      for (let col = 0; col < cols && enemiesCreated < enemyCount; col++) {
        const x = startX + col * spacingX;
        const y = startY + row * spacingY;
        const enemy = this.enemies.create(x, y, 'enemy');
        enemy.setVelocity(
          Phaser.Math.Between(-50, 50),
          Phaser.Math.Between(20, 50)
        );
        enemy.setBounce(1);
        enemy.setCollideWorldBounds(true);
        enemiesCreated++;
      }
    }

    // 更新UI
    this.updateUI();

    // 显示关卡开始信息
    this.messageText.setText(`Level ${this.currentLevel}\nStart!`);
    this.time.delayedCall(1500, () => {
      this.messageText.setText('');
    });
  }

  update(time, delta) {
    // 玩家移动
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-300);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(300);
    } else {
      this.player.setVelocityX(0);
    }

    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-300);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(300);
    } else {
      this.player.setVelocityY(0);
    }

    // 射击
    if (this.spaceKey.isDown && this.canShoot) {
      this.shoot();
      this.canShoot = false;
      this.time.delayedCall(200, () => {
        this.canShoot = true;
      });
    }

    // 清理超出边界的子弹
    this.bullets.children.entries.forEach(bullet => {
      if (bullet.active && bullet.y < 0) {
        bullet.setActive(false);
        bullet.setVisible(false);
      }
    });
  }

  shoot() {
    const bullet = this.bullets.get(this.player.x, this.player.y - 20);
    if (bullet) {
      bullet.setActive(true);
      bullet.setVisible(true);
      bullet.setVelocityY(-400);
    }
  }

  hitEnemy(bullet, enemy) {
    // 销毁子弹和敌人
    bullet.setActive(false);
    bullet.setVisible(false);
    enemy.destroy();

    // 更新分数和剩余敌人数
    this.score += 10;
    this.enemiesRemaining--;
    this.updateUI();

    // 检查是否通关
    if (this.enemiesRemaining === 0) {
      this.levelComplete();
    }
  }

  levelComplete() {
    if (this.currentLevel < this.maxLevel) {
      // 进入下一关
      this.currentLevel++;
      this.messageText.setText(`Level ${this.currentLevel - 1} Complete!\nNext Level...`);
      this.time.delayedCall(2000, () => {
        this.startLevel();
      });
    } else {
      // 游戏胜利
      this.messageText.setText(`Victory!\nAll ${this.maxLevel} Levels Complete!\nFinal Score: ${this.score}`);
      this.physics.pause();
    }
  }

  updateUI() {
    this.levelText.setText(`Level: ${this.currentLevel}/${this.maxLevel}`);
    this.enemyCountText.setText(`Enemies: ${this.enemiesRemaining}`);
    this.scoreText.setText(`Score: ${this.score}`);
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#000000',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: GameScene
};

const game = new Phaser.Game(config);