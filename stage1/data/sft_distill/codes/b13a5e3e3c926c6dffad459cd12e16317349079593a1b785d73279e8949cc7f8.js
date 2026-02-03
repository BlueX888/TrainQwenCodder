class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.SAVE_KEY = 'phaser_game_save';
    this.score = 12;
    this.level = 1;
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 从 localStorage 加载存档
    this.loadGameData();

    // 绘制背景
    const bg = this.add.graphics();
    bg.fillStyle(0x1a1a2e, 1);
    bg.fillRect(0, 0, 800, 600);

    // 绘制主面板
    const panel = this.add.graphics();
    panel.fillStyle(0x16213e, 1);
    panel.fillRoundedRect(150, 100, 500, 400, 16);
    panel.lineStyle(3, 0x0f3460, 1);
    panel.strokeRoundedRect(150, 100, 500, 400, 16);

    // 标题
    const title = this.add.text(400, 140, 'GAME SAVE SYSTEM', {
      fontSize: '32px',
      fontFamily: 'Arial',
      color: '#e94560',
      fontStyle: 'bold'
    });
    title.setOrigin(0.5);

    // 显示 Score
    this.scoreLabel = this.add.text(250, 220, 'SCORE:', {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#ffffff'
    });

    this.scoreValue = this.add.text(550, 220, this.score.toString(), {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#00ff00',
      fontStyle: 'bold'
    });
    this.scoreValue.setOrigin(1, 0);

    // 显示 Level
    this.levelLabel = this.add.text(250, 270, 'LEVEL:', {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#ffffff'
    });

    this.levelValue = this.add.text(550, 270, this.level.toString(), {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#00ffff',
      fontStyle: 'bold'
    });
    this.levelValue.setOrigin(1, 0);

    // 分隔线
    const line = this.add.graphics();
    line.lineStyle(2, 0x0f3460, 1);
    line.lineBetween(200, 320, 600, 320);

    // 操作说明
    const instructions = [
      'CONTROLS:',
      'S - Increase Score (+10)',
      'L - Increase Level (+1)',
      'SPACE - Save Game',
      'R - Reset to Default'
    ];

    instructions.forEach((text, index) => {
      const style = index === 0 
        ? { fontSize: '18px', color: '#e94560', fontStyle: 'bold' }
        : { fontSize: '16px', color: '#aaaaaa' };
      
      this.add.text(220, 340 + index * 25, text, {
        fontFamily: 'Arial',
        ...style
      });
    });

    // 状态消息
    this.statusText = this.add.text(400, 520, '', {
      fontSize: '16px',
      fontFamily: 'Arial',
      color: '#ffff00'
    });
    this.statusText.setOrigin(0.5);

    // 显示加载状态
    if (this.wasLoaded) {
      this.showStatus('Game data loaded from save!', 0x00ff00);
    } else {
      this.showStatus('New game started (Score: 12, Level: 1)', 0xaaaaaa);
    }

    // 键盘输入
    this.input.keyboard.on('keydown-S', () => {
      this.score += 10;
      this.updateDisplay();
      this.showStatus('Score increased!', 0x00ff00);
    });

    this.input.keyboard.on('keydown-L', () => {
      this.level += 1;
      this.updateDisplay();
      this.showStatus('Level up!', 0x00ffff);
    });

    this.input.keyboard.on('keydown-SPACE', () => {
      this.saveGameData();
    });

    this.input.keyboard.on('keydown-R', () => {
      this.resetGameData();
    });

    // 绘制装饰性元素
    this.createDecorations();
  }

  loadGameData() {
    try {
      const savedData = localStorage.getItem(this.SAVE_KEY);
      if (savedData) {
        const data = JSON.parse(savedData);
        this.score = data.score || 12;
        this.level = data.level || 1;
        this.wasLoaded = true;
      } else {
        this.score = 12;
        this.level = 1;
        this.wasLoaded = false;
      }
    } catch (error) {
      console.error('Failed to load game data:', error);
      this.score = 12;
      this.level = 1;
      this.wasLoaded = false;
    }
  }

  saveGameData() {
    try {
      const saveData = {
        score: this.score,
        level: this.level,
        timestamp: Date.now()
      };
      localStorage.setItem(this.SAVE_KEY, JSON.stringify(saveData));
      this.showStatus('Game saved successfully!', 0xffff00);
      
      // 添加保存动画效果
      this.tweens.add({
        targets: [this.scoreValue, this.levelValue],
        scale: 1.2,
        duration: 100,
        yoyo: true,
        ease: 'Quad.easeInOut'
      });
    } catch (error) {
      console.error('Failed to save game data:', error);
      this.showStatus('Save failed!', 0xff0000);
    }
  }

  resetGameData() {
    try {
      localStorage.removeItem(this.SAVE_KEY);
      this.score = 12;
      this.level = 1;
      this.updateDisplay();
      this.showStatus('Game reset to default!', 0xff8800);
    } catch (error) {
      console.error('Failed to reset game data:', error);
    }
  }

  updateDisplay() {
    this.scoreValue.setText(this.score.toString());
    this.levelValue.setText(this.level.toString());
  }

  showStatus(message, color) {
    this.statusText.setText(message);
    this.statusText.setColor('#' + color.toString(16).padStart(6, '0'));
    
    // 淡入淡出效果
    this.statusText.setAlpha(1);
    this.tweens.add({
      targets: this.statusText,
      alpha: 0.3,
      duration: 2000,
      ease: 'Quad.easeOut'
    });
  }

  createDecorations() {
    // 创建装饰性角标
    const corners = this.add.graphics();
    corners.lineStyle(3, 0xe94560, 1);
    
    // 左上角
    corners.strokeLineShape(new Phaser.Geom.Line(160, 110, 180, 110));
    corners.strokeLineShape(new Phaser.Geom.Line(160, 110, 160, 130));
    
    // 右上角
    corners.strokeLineShape(new Phaser.Geom.Line(620, 110, 640, 110));
    corners.strokeLineShape(new Phaser.Geom.Line(640, 110, 640, 130));
    
    // 左下角
    corners.strokeLineShape(new Phaser.Geom.Line(160, 470, 180, 470));
    corners.strokeLineShape(new Phaser.Geom.Line(160, 470, 160, 490));
    
    // 右下角
    corners.strokeLineShape(new Phaser.Geom.Line(620, 490, 640, 490));
    corners.strokeLineShape(new Phaser.Geom.Line(640, 470, 640, 490));
  }

  update(time, delta) {
    // 可以添加持续性动画效果
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#000000',
  scene: GameScene,
  parent: 'game-container'
};

const game = new Phaser.Game(config);