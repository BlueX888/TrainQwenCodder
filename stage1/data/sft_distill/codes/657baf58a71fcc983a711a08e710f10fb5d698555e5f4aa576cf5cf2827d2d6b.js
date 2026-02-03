// MenuScene - 菜单场景
class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene');
    this.menuState = 'idle'; // 状态信号：idle/hovering
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    const { width, height } = this.cameras.main;
    
    // 绘制背景
    const bg = this.add.graphics();
    bg.fillStyle(0x1a1a2e, 1);
    bg.fillRect(0, 0, width, height);
    
    // 按钮尺寸和位置
    const buttonWidth = 200;
    const buttonHeight = 60;
    const buttonX = width / 2 - buttonWidth / 2;
    const buttonY = height / 2 - buttonHeight / 2;
    
    // 绘制青色按钮
    this.buttonGraphics = this.add.graphics();
    this.buttonGraphics.fillStyle(0x00CED1, 1); // 青色 (DarkTurquoise)
    this.buttonGraphics.fillRoundedRect(buttonX, buttonY, buttonWidth, buttonHeight, 10);
    
    // 添加按钮文本
    const buttonText = this.add.text(width / 2, height / 2, '开始游戏', {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#ffffff',
      fontStyle: 'bold'
    });
    buttonText.setOrigin(0.5);
    
    // 添加标题
    const title = this.add.text(width / 2, height / 3, 'PHASER GAME', {
      fontSize: '48px',
      fontFamily: 'Arial',
      color: '#00CED1',
      fontStyle: 'bold'
    });
    title.setOrigin(0.5);
    
    // 创建交互区域
    const buttonZone = this.add.zone(width / 2, height / 2, buttonWidth, buttonHeight);
    buttonZone.setInteractive({ useHandCursor: true });
    
    // 鼠标悬停效果
    buttonZone.on('pointerover', () => {
      this.menuState = 'hovering';
      this.buttonGraphics.clear();
      this.buttonGraphics.fillStyle(0x00FFFF, 1); // 更亮的青色
      this.buttonGraphics.fillRoundedRect(buttonX, buttonY, buttonWidth, buttonHeight, 10);
    });
    
    buttonZone.on('pointerout', () => {
      this.menuState = 'idle';
      this.buttonGraphics.clear();
      this.buttonGraphics.fillStyle(0x00CED1, 1);
      this.buttonGraphics.fillRoundedRect(buttonX, buttonY, buttonWidth, buttonHeight, 10);
    });
    
    // 点击按钮切换场景
    buttonZone.on('pointerdown', () => {
      this.menuState = 'clicked';
      // 添加点击动画效果
      this.tweens.add({
        targets: [this.buttonGraphics, buttonText],
        scaleX: 0.95,
        scaleY: 0.95,
        duration: 100,
        yoyo: true,
        onComplete: () => {
          // 切换到游戏场景
          this.scene.start('GameScene');
        }
      });
    });
    
    // 添加提示文本
    const hint = this.add.text(width / 2, height * 0.75, '点击按钮开始游戏', {
      fontSize: '16px',
      fontFamily: 'Arial',
      color: '#888888'
    });
    hint.setOrigin(0.5);
  }
}

// GameScene - 游戏场景
class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    // 状态信号
    this.score = 0;
    this.level = 1;
    this.health = 100;
    this.gameState = 'playing'; // playing/paused/gameover
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    const { width, height } = this.cameras.main;
    
    // 绘制游戏背景
    const bg = this.add.graphics();
    bg.fillStyle(0x0f0f23, 1);
    bg.fillRect(0, 0, width, height);
    
    // 创建玩家（使用 Graphics）
    this.player = this.add.graphics();
    this.player.fillStyle(0x00ff00, 1);
    this.player.fillCircle(0, 0, 20);
    this.player.x = width / 2;
    this.player.y = height / 2;
    
    // 创建目标物体
    this.target = this.add.graphics();
    this.target.fillStyle(0xff0000, 1);
    this.target.fillRect(-15, -15, 30, 30);
    this.target.x = Phaser.Math.Between(50, width - 50);
    this.target.y = Phaser.Math.Between(50, height - 50);
    
    // UI 文本 - 显示状态信号
    this.scoreText = this.add.text(20, 20, `分数: ${this.score}`, {
      fontSize: '20px',
      fontFamily: 'Arial',
      color: '#ffffff'
    });
    
    this.levelText = this.add.text(20, 50, `等级: ${this.level}`, {
      fontSize: '20px',
      fontFamily: 'Arial',
      color: '#ffffff'
    });
    
    this.healthText = this.add.text(20, 80, `生命值: ${this.health}`, {
      fontSize: '20px',
      fontFamily: 'Arial',
      color: '#00ff00'
    });
    
    this.stateText = this.add.text(width / 2, 20, '游戏进行中', {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#00CED1'
    });
    this.stateText.setOrigin(0.5, 0);
    
    // 返回菜单按钮
    const backButton = this.add.text(width - 20, 20, '返回菜单', {
      fontSize: '18px',
      fontFamily: 'Arial',
      color: '#00CED1'
    });
    backButton.setOrigin(1, 0);
    backButton.setInteractive({ useHandCursor: true });
    
    backButton.on('pointerover', () => {
      backButton.setColor('#00FFFF');
    });
    
    backButton.on('pointerout', () => {
      backButton.setColor('#00CED1');
    });
    
    backButton.on('pointerdown', () => {
      this.scene.start('MenuScene');
    });
    
    // 键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();
    
    // 鼠标点击目标
    this.target.setInteractive(
      new Phaser.Geom.Rectangle(-15, -15, 30, 30),
      Phaser.Geom.Rectangle.Contains
    );
    
    this.target.on('pointerdown', () => {
      this.collectTarget();
    });
    
    // 游戏说明
    const instructions = this.add.text(width / 2, height - 40, '使用方向键移动绿色圆圈，点击红色方块得分', {
      fontSize: '16px',
      fontFamily: 'Arial',
      color: '#888888'
    });
    instructions.setOrigin(0.5);
  }

  update(time, delta) {
    if (this.gameState !== 'playing') return;
    
    const speed = 3;
    
    // 键盘控制玩家移动
    if (this.cursors.left.isDown) {
      this.player.x -= speed;
    } else if (this.cursors.right.isDown) {
      this.player.x += speed;
    }
    
    if (this.cursors.up.isDown) {
      this.player.y -= speed;
    } else if (this.cursors.down.isDown) {
      this.player.y += speed;
    }
    
    // 边界检测
    const { width, height } = this.cameras.main;
    this.player.x = Phaser.Math.Clamp(this.player.x, 20, width - 20);
    this.player.y = Phaser.Math.Clamp(this.player.y, 20, height - 20);
    
    // 碰撞检测
    const distance = Phaser.Math.Distance.Between(
      this.player.x, this.player.y,
      this.target.x, this.target.y
    );
    
    if (distance < 35) {
      this.collectTarget();
    }
  }

  collectTarget() {
    // 更新分数
    this.score += 10;
    this.scoreText.setText(`分数: ${this.score}`);
    
    // 每 50 分升级
    if (this.score % 50 === 0 && this.score > 0) {
      this.level++;
      this.levelText.setText(`等级: ${this.level}`);
      
      // 显示升级提示
      const levelUpText = this.add.text(
        this.cameras.main.width / 2,
        this.cameras.main.height / 2,
        `等级提升！LV ${this.level}`,
        {
          fontSize: '32px',
          fontFamily: 'Arial',
          color: '#FFD700'
        }
      );
      levelUpText.setOrigin(0.5);
      
      this.tweens.add({
        targets: levelUpText,
        alpha: 0,
        y: levelUpText.y - 50,
        duration: 1500,
        onComplete: () => {
          levelUpText.destroy();
        }
      });
    }
    
    // 重新定位目标
    const { width, height } = this.cameras.main;
    this.target.x = Phaser.Math.Between(50, width - 50);
    this.target.y = Phaser.Math.Between(50, height - 50);
    
    // 添加收集动画
    this.tweens.add({
      targets: this.target,
      scaleX: 1.2,
      scaleY: 1.2,
      duration: 100,
      yoyo: true
    });
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#000000',
  scene: [MenuScene, GameScene],
  parent: 'game-container'
};

// 启动游戏
new Phaser.Game(config);